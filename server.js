const http = require("http");
const fs = require("fs");
const path = require("path");

const parsePortArg = () => {
  const portIndex = process.argv.indexOf("--port");
  if (portIndex !== -1 && process.argv[portIndex + 1]) {
    const parsed = Number.parseInt(process.argv[portIndex + 1], 10);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return null;
};

const port = Number.parseInt(process.env.PORT, 10) || parsePortArg() || 3000;
const rootDir = path.resolve(__dirname);

const mimeTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const serveFile = (filePath, res) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(err.code === "ENOENT" ? 404 : 500, {
        "Content-Type": "text/plain",
      });
      res.end(err.code === "ENOENT" ? "Not found" : "Server error");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
    });
    res.end(data);
  });
};

const server = http.createServer((req, res) => {
  if (!req.url || !req.headers.host) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Bad request");
    return;
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(requestUrl.pathname);
  if (pathname.endsWith("/")) {
    pathname = `${pathname}index.html`;
  }
  if (pathname === "/") {
    pathname = "/index.html";
  }

  const resolvedPath = path.normalize(path.join(rootDir, pathname));
  if (!resolvedPath.startsWith(rootDir)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("Forbidden");
    return;
  }

  serveFile(resolvedPath, res);
});

server.listen(port, () => {
  console.log(`Ontology Value Dashboard running at http://localhost:${port}`);
});
