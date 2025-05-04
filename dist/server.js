"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_1 = __importDefault(require("./src/lib/socket"));
const next_1 = __importDefault(require("next"));
const node_url_1 = require("node:url");
// 解析命令行参数
function parseArgs() {
    const args = process.argv.slice(2);
    const result = {};
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--host' && args[i + 1]) {
            result.host = args[++i];
        }
        else if (arg === '--port' && args[i + 1]) {
            result.port = parseInt(args[++i], 10);
        }
    }
    return result;
}
const args = parseArgs();
const port = args.port || parseInt(process.env.PORT || "3000", 10);
const host = args.host || process.env.HOST || "localhost";
const dev = process.env.NODE_ENV !== "production";
const app = (0, next_1.default)({ dev });
const handle = app.getRequestHandler();
app.prepare().then(() => {
    const httpServer = (0, http_1.createServer)((req, res) => {
        const parsedUrl = (0, node_url_1.parse)(req.url, true);
        handle(req, res, parsedUrl);
    });
    // 初始化Socket.io
    socket_1.default.init(httpServer);
    httpServer.listen(port, host, () => {
        console.log(`> Ready on http://${host}:${port}`);
    });
}).catch((err) => {
    console.error('Server startup error:', err);
    process.exit(1);
});
