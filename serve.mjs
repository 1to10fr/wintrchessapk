// Dependency-free static server for the client-only build.
// Usage: npm run build -w client && node serve.mjs   (PORT=8080 by default)
// Needs only Node.js 14+; no database, no accounts, no other packages.
import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { createGzip } from "node:zlib";
import { extname, join, normalize, resolve, sep } from "node:path";

const ROOTS = [resolve("client/dist"), resolve("client/public")];
const APPS = resolve("client/public/apps");
const PORT = Number(process.env.PORT) || 8080;

const PAGES = {
    "/analysis": "features/analysis.html",
    "/settings": "settings.html"
};

const TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".wasm": "application/wasm",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".ico": "image/x-icon",
    ".mp3": "audio/mpeg",
    ".ttf": "font/ttf",
    ".woff2": "font/woff2",
    ".txt": "text/plain; charset=utf-8"
};

const COMPRESSIBLE = new Set([".html", ".js", ".css", ".json", ".wasm", ".svg"]);

function findFile(urlPath) {
    for (const root of ROOTS) {
        const file = normalize(join(root, urlPath));

        // Block path traversal outside the served roots
        if (file !== root && !file.startsWith(root + sep)) continue;

        try {
            if (statSync(file).isFile()) return file;
        } catch {
            // not found in this root, try the next
        }
    }
}

function send(req, res, file, status = 200) {
    const ext = extname(file).toLowerCase();
    const gzip = COMPRESSIBLE.has(ext)
        && /\bgzip\b/.test(req.headers["accept-encoding"] || "");

    res.writeHead(status, {
        "Content-Type": TYPES[ext] || "application/octet-stream",
        "Cache-Control": file.includes(`${sep}engines${sep}`)
            ? "public, max-age=2592000"
            : "public, max-age=300",
        ...(gzip && { "Content-Encoding": "gzip", "Vary": "Accept-Encoding" })
    });

    const stream = createReadStream(file);
    stream.on("error", () => res.destroy());
    (gzip ? stream.pipe(createGzip()) : stream).pipe(res);
}

createServer((req, res) => {
    let pathname;

    try {
        pathname = decodeURIComponent(new URL(req.url, "http://x").pathname);
    } catch {
        res.writeHead(400);
        return res.end();
    }

    if (pathname === "/") {
        res.writeHead(302, { Location: "/analysis" });
        return res.end();
    }

    const page = PAGES[pathname.replace(/\/+$/, "")];
    if (page) return send(req, res, join(APPS, page));

    const file = findFile(pathname);
    if (file) return send(req, res, file);

    send(req, res, join(APPS, "unfound.html"), 404);
}).listen(PORT, "0.0.0.0", () => {
    console.log(`WintrChess (client-only) listening on http://0.0.0.0:${PORT}`);
});
