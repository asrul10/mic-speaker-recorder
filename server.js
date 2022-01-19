const http = require("http");
const fs = require("fs");
const path = require("path");
const port = 3001;

http
  .createServer((req, res) => {
    if (req.url === "/") {
      req.url = "./example/index.html";
    }
    const filename = path.join(__dirname, req.url);
    const stream = fs.createReadStream(filename);
    stream.on("error", () => {
      res.writeHead(404);
      res.end();
    });
    stream.pipe(res);
  })
  .listen(port);

setTimeout(() => {
  console.log("\x1b[33m%s\x1b[0m", "Server running... 🎉");
  console.log("\x1b[32m%s\x1b[0m", `http://localhost:${port}`);
}, 100);
