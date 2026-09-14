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

async function loadLocalData() {
  const portfolioPath = pathToFileURL(
    path.join(rootDir, "src/data/portfolio.js"),
  ).href;
  const musicPath = pathToFileURL(path.join(rootDir, "src/data/music.js")).href;

  const portfolioModule = await import(portfolioPath);
  const musicModule = await import(musicPath);

  return {
    portfolio: portfolioModule,
    music: musicModule,
  };
}

async function buildContext() {
  const { portfolio, music } = await loadLocalData();

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
  console.log(
    `[ai-context] Generated ${context.length} chunks at ${outputFile}`,
  );
}

run().catch((error) => {
  console.error("[ai-context] Failed to generate context:", error);
  process.exit(1);
});
