import { createServer } from "http";
import socket from "./src/lib/socket";
import next from "next";
import { parse } from 'node:url';

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const result: { host?: string; port?: number } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--host' && args[i + 1]) {
      result.host = args[++i];
    } else if (arg === '--port' && args[i + 1]) {
      result.port = parseInt(args[++i], 10);
    }
  }

  return result;
}

const args = parseArgs();
const port = args.port || parseInt(process.env.PORT || "3000", 10);
const host = args.host || process.env.HOST || "localhost";
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // 初始化Socket.io
  socket.init(httpServer)

  httpServer.listen(port, host, () => {
    console.log(`> Ready on http://${host}:${port}`);
  });
}).catch((err: Error) => {
  console.error('Server startup error:', err);
  process.exit(1);
});