import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import { LiveHub } from "./server/live-hub.mjs";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const PRODUCTION = process.argv.includes("--production");
const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 5173);
const MIME = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const hub = new LiveHub();
let vite;

function serveDist(request, response) {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const relative = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, "").replace(/^[/\\]+/, "");
  let path = join(ROOT, "dist", relative || "index.html");
  if (!existsSync(path) || statSync(path).isDirectory()) path = join(ROOT, "dist", "index.html");
  response.writeHead(200, {
    "content-type": MIME[extname(path)] || "application/octet-stream",
    "cache-control": path.endsWith("index.html") ? "no-store" : "public, max-age=3600",
  });
  createReadStream(path).pipe(response);
}

const server = createServer(async (request, response) => {
  if (await hub.handle(request, response)) return;
  if (PRODUCTION) {
    serveDist(request, response);
    return;
  }
  vite.middlewares(request, response, (error) => {
    if (error) {
      vite.ssrFixStacktrace(error);
      response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      response.end(error.stack);
    }
  });
});

if (!PRODUCTION) {
  vite = await createViteServer({
    root: ROOT,
    appType: "spa",
    server: { middlewareMode: true, hmr: { server } },
  });
} else if (!existsSync(join(ROOT, "dist", "index.html"))) {
  console.error("Le build client/dist manque. Lancez d’abord npm run build.");
  process.exit(1);
}

server.listen(PORT, HOST, () => {
  console.log(`NaviMap live : http://localhost:${PORT}`);
  console.log(`SSE : http://localhost:${PORT}/api/events`);
});

async function shutdown() {
  hub.close();
  await vite?.close();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
