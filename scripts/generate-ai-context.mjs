import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { config as loadEnv } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const generatedDir = path.join(rootDir, "generated");
const outputFile = path.join(generatedDir, "ai-context.json");
loadEnv({ path: path.join(rootDir, ".env") });

function normalizeText(value) {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildKeywords(...parts) {
  const normalized = normalizeText(parts.filter(Boolean).join(" "));
  const words = normalized.split(" ").filter((word) => word.length > 2);
  return [...new Set(words)].slice(0, 50);
}

function createChunk({ id, type, title, content, url, section }) {
  return {
    id,
    type,
    title,
    content,
    url,
    section,
    keywords: buildKeywords(type, title, content, section),
  };
}

function parseMdxFile(raw) {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("---")) {
    return { frontmatter: {}, body: trimmed };
  }

  const end = trimmed.indexOf("\n---", 3);
  if (end < 0) {
    return { frontmatter: {}, body: trimmed };
  }

  const frontmatterRaw = trimmed.slice(3, end).trim();
  const body = trimmed.slice(end + 4).trim();
  const frontmatter = {};

  for (const line of frontmatterRaw.split("\n")) {
    const match = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!match) continue;
    const [, key, value] = match;
    frontmatter[key] = value.replace(/^['\"]|['\"]$/g, "");
  }

  return { frontmatter, body };
}

async function getGithubRepos() {
  const username = process.env.GITHUB_USERNAME;
  if (!username) {
    console.warn("[ai-context] Missing GITHUB_USERNAME. Skipping GitHub projects.");
    return [];
  }

  const headers = {
    Accept: "application/vnd.github+json",
  };

  if (process.env.GITHUB_ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`;
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
      { headers },
    );

    if (!response.ok) {
      console.warn(`[ai-context] GitHub API request failed: ${response.status}`);
      return [];
    }

    const repos = await response.json();
    return repos
      .filter((repo) => !repo.fork)
      .slice(0, 40)
      .map((repo) => ({
        name: repo.name,
        description: repo.description || "",
        language: repo.language || "",
        html_url: repo.html_url,
        homepage: repo.homepage || "",
        topics: Array.isArray(repo.topics) ? repo.topics : [],
      }));
  } catch (error) {
    console.warn("[ai-context] Failed to fetch GitHub repositories:", error.message);
    return [];
  }
}

async function loadLocalData() {
  const portfolioPath = pathToFileURL(path.join(rootDir, "src/data/portfolio.js")).href;
  const blogsPath = pathToFileURL(path.join(rootDir, "src/utils/blogs.js")).href;
  const githubPath = pathToFileURL(path.join(rootDir, "src/utils/github.js")).href;

  const portfolioModule = await import(portfolioPath);
  const blogsModule = await import(blogsPath);
  const githubModule = await import(githubPath);

  return {
    portfolio: portfolioModule,
    blogs: blogsModule.default || [],
    github: githubModule,
  };
}

async function getBlogMdxChunks() {
  const blogDir = path.join(rootDir, "src/pages/blog");

  try {
    const files = await fs.readdir(blogDir);
    const mdxFiles = files.filter((name) => name.endsWith(".mdx"));
    const chunks = [];

    for (const filename of mdxFiles) {
      const fullPath = path.join(blogDir, filename);
      const raw = await fs.readFile(fullPath, "utf8");
      const parsed = parseMdxFile(raw);
      const slug = filename.replace(/\.mdx$/, "");
      const title = parsed.frontmatter.title || slug.replace(/-/g, " ");
      const excerpt = parsed.body.replace(/\s+/g, " ").slice(0, 900);

      chunks.push(
        createChunk({
          id: `blog-mdx:${slug}`,
          type: "blog",
          title,
          content: excerpt,
          url: `/blog/${slug}`,
          section: "blog",
        }),
      );
    }

    return chunks;
  } catch {
    return [];
  }
}

async function buildContext() {
  const { portfolio, blogs, github } = await loadLocalData();
  const githubData = await github.fetchPinnedGithubData({
    githubUsername: process.env.GITHUB_USERNAME,
    githubAccessToken: process.env.GITHUB_ACCESS_TOKEN,
  });

  if (githubData.error) {
    console.warn(`[ai-context] ${githubData.error}`);
  }

  const pinnedProjects = githubData.projects || [];
  const languageStats = github.computeLanguageStats(pinnedProjects);
  const githubRepos = pinnedProjects.map((repo) => ({
    name: repo.name,
    description: repo.description || "",
    html_url: repo.url || "",
    homepage: repo.homepageUrl || "",
    topics: (repo.repositoryTopics?.edges || [])
      .map((edge) => edge?.node?.topic?.name)
      .filter(Boolean),
    languages: (repo.languages?.edges || [])
      .map((edge) => edge?.node?.name)
      .filter(Boolean),
  }));

  if (githubRepos.length === 0) {
    const fallbackRepos = await getGithubRepos();
    for (const repo of fallbackRepos) {
      githubRepos.push({
        name: repo.name,
        description: repo.description || "",
        html_url: repo.html_url || "",
        homepage: repo.homepage || "",
        topics: repo.topics || [],
        languages: repo.language ? [repo.language] : [],
      });
    }
  }

  const blogMdxChunks = await getBlogMdxChunks();

  const chunks = [];

  chunks.push(
    createChunk({
      id: "bio:summary",
      type: "bio",
      title: "Boston Rohan",
      content: `${portfolio.landingBody} ${portfolio.landingLinks.map((link) => link.text).join(" ")}`,
      url: "/",
      section: "home",
    }),
  );

  portfolio.experienceJobs.forEach((job, index) => {
    const roleSummary = job.roles
      .map((role) => `${role.title} (${role.tenure})`)
      .join(", ");

    chunks.push(
      createChunk({
        id: `experience:${index}`,
        type: "experience",
        title: job.title,
        content: `${job.title}. ${roleSummary}. Employment type: ${job.type || "Full-Time"}.`,
        url: "/#experience",
        section: "experience",
      }),
    );
  });

  blogs.forEach((blog, index) => {
    const slug = blog.title.replace(/\s+/g, "-").toLowerCase();
    chunks.push(
      createChunk({
        id: `blog-meta:${index}`,
        type: "blog",
        title: blog.title,
        content: `${blog.body} Published: ${blog.date}. Estimated read: ${blog.readTime}.`,
        url: `/blog/${slug}`,
        section: "blog",
      }),
    );
  });

  chunks.push(...blogMdxChunks);

  githubRepos
    .filter((repo) => repo.name !== "portfolio")
    .forEach((repo) => {
      const content = [
        repo.description,
        repo.languages.length ? `Languages: ${repo.languages.join(", ")}.` : "",
        repo.topics.length ? `Topics: ${repo.topics.join(", ")}.` : "",
        repo.homepage ? `Homepage: ${repo.homepage}.` : "",
      ]
        .filter(Boolean)
        .join(" ");

      chunks.push(
        createChunk({
          id: `project:${repo.name}`,
          type: "project",
          title: repo.name,
          content,
          url: repo.html_url,
          section: "projects",
        }),
      );
    });

  if (languageStats.length) {
    const languageSummary = languageStats
      .map(
        (entry) =>
          `${entry.language}: ${entry.percent}% (${entry.projectCount}/${entry.totalProjects} pinned projects).`,
      )
      .join(" ");

    chunks.push(
      createChunk({
        id: "projects:language-stats",
        type: "project",
        title: "Pinned project language percentages",
        content: `Language distribution across pinned projects. ${languageSummary}`,
        url: "/#projects",
        section: "projects",
      }),
    );
  }

  chunks.push(
    createChunk({
      id: "contact:summary",
      type: "contact",
      title: "Contact",
      content: portfolio.contactSummary,
      url: "/#contact",
      section: "contact",
    }),
  );

  return chunks;
}

async function run() {
  const context = await buildContext();
  await fs.mkdir(generatedDir, { recursive: true });
  await fs.writeFile(outputFile, JSON.stringify(context, null, 2), "utf8");
  console.log(`[ai-context] Generated ${context.length} chunks at ${outputFile}`);
}

run().catch((error) => {
  console.error("[ai-context] Failed to generate context:", error);
  process.exit(1);
});
