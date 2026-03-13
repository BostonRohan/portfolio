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

async function loadLocalData() {
  const portfolioPath = pathToFileURL(path.join(rootDir, "src/data/portfolio.js")).href;
  const musicPath = pathToFileURL(path.join(rootDir, "src/data/music.js")).href;
  const blogsPath = pathToFileURL(path.join(rootDir, "src/utils/blogs.js")).href;

  const portfolioModule = await import(portfolioPath);
  const musicModule = await import(musicPath);
  const blogsModule = await import(blogsPath);

  return {
    portfolio: portfolioModule,
    music: musicModule,
    blogs: blogsModule.default || [],
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
  const { portfolio, music, blogs } = await loadLocalData();

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

  chunks.push(
    createChunk({
      id: "music:profile",
      type: "music",
      title: "Music profile",
      content: `${music.musicProfile.summary} ${music.musicProfile.aiContextNotes.join(" ")}`,
      url: music.musicProfile.lastfmUrl,
      section: "music",
    }),
  );

  chunks.push(
    createChunk({
      id: "music:manual-top-artists",
      type: "music",
      title: "Monthly top artists before Spotify cancellation",
      content: `Manual music context: ${music.musicProfile.monthlySpotifyArtists.join(", ")}.`,
      url: music.musicProfile.lastfmUrl,
      section: "music",
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
