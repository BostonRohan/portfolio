import { readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

export async function instrumentStartup(root) {
  const folder = resolve(root, ".vercel/output/functions/_render.func");
  const configPath = resolve(folder, ".vc-config.json");
  const config = JSON.parse(await readFile(configPath, "utf8"));
  const entry = resolve(folder, config.handler);
  const entryRelative = relative(folder, entry);
  if (entryRelative.startsWith("..") || isAbsolute(entryRelative)) {
    throw new Error("Unexpected Vercel handler path");
  }
  const source = await readFile(entry, "utf8");
  const pageImport =
    /const (_page\d+) = \(\) => import\((['"])\.\/pages\/index\.astro\.mjs\2\);/;
  if (!pageImport.test(source)) {
    throw new Error("Homepage loader was not found in the Vercel entry");
  }
  await writeFile(
    entry,
    'import { measure } from "./startupTiming.mjs";\n' +
      source.replace(
        pageImport,
        'const $1 = () => measure("homepage-module-import", async () => { await measure("sentry-sdk-import", () => import("@sentry/astro")); return import("./pages/index.astro.mjs"); });',
      ),
  );
  const helper = `import { AsyncLocalStorage } from "node:async_hooks";
export const context = new AsyncLocalStorage();
export function mark(event, details = {}) {
  const active = context.getStore();
  if (!active) return;
  console.info("[startup-timing] " + JSON.stringify({
    requestId: active.requestId, event, timestamp: new Date().toISOString(),
    elapsedMs: Math.round(performance.now() - active.start), ...details,
  }));
}
export async function measure(operation, run) {
  const start = performance.now();
  mark(operation + "-start");
  try { return await run(); }
  finally { mark(operation + "-end", { durationMs: Math.round(performance.now() - start) }); }
}
`;
  const wrapper = `import { context, mark, measure } from "./startupTiming.mjs";
console.info("[startup-timing] " + JSON.stringify({ event: "wrapper-loaded", timestamp: new Date().toISOString() }));
let server;
let ordinal = 0;
export default async function handler(req, res) {
  const isHomepage = req.url?.split("?")[0] === "/";
  const active = isHomepage ? { requestId: crypto.randomUUID(), start: performance.now() } : undefined;
  return context.run(active, async () => {
    mark("handler-entry", { ordinal: ++ordinal, entryImportStarted: Boolean(server) });
    if (active) {
      res.once("finish", () => context.run(active, () => mark("response-finished", { status: res.statusCode })));
      res.once("close", () => context.run(active, () => { if (!res.writableFinished) mark("response-aborted"); }));
    }
    try {
      const module = await measure("server-entry-import", () => {
        server ??= import(${JSON.stringify("./" + basename(entry))}).catch(error => { server = undefined; throw error; });
        return server;
      });
      mark("astro-handler-start");
      await module.default(req, res);
      mark("astro-handler-returned");
    } catch (error) {
      mark("handler-failed", { errorName: error instanceof Error ? error.name : "Unknown" });
      throw error;
    }
  });
}
`;
  await writeFile(resolve(dirname(entry), "startupTiming.mjs"), helper);
  await writeFile(resolve(dirname(entry), "startupEntry.mjs"), wrapper);
  config.handler = relative(
    folder,
    resolve(dirname(entry), "startupEntry.mjs"),
  );
  await writeFile(configPath, JSON.stringify(config, null, 2) + "\n");
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  if (process.env.VERCEL_ENV === "preview") {
    await instrumentStartup(process.cwd());
    console.info("[startup-build] preview entry instrumentation installed");
  }
}
