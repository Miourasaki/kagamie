"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
class SocketManager {
    constructor() {
        this._gabanNamespace = null;
    }
    // 使用全局变量存储实例，防止热重载时丢失
    get instance() {
        return global._socketManagerInstance || null;
    }
    set instance(instance) {
        global._socketManagerInstance = instance;
    }
    // 初始化方法
    init(server) {
        if (this.instance) {
            return this.instance;
        }
        const io = new socket_io_1.Server(server, {
            path: '/socket.io'
        });
        this.setupGabanNamespace(io);
        this.instance = io;
        return io;
    }
    // 获取实例方法
    getInstance() {
        if (!this.instance) {
            throw new Error('Socket.io not initialized. Please call SocketManager.init() first.');
        }
        return this.instance;
    }
    getGabanNamespace() {
        if (!this._gabanNamespace) {
            this._gabanNamespace = this.getInstance().of('/gaban');
        }
        return this._gabanNamespace;
    }
    // 画板命名空间设置
    setupGabanNamespace(io) {
        this._gabanNamespace = io.of('/gaban');
        this._gabanNamespace.on('connection', (socket) => {
            const gabanId = socket.handshake.query.gabanId;
            if (!gabanId) {
                socket.disconnect(true);
                return;
            }
            const roomName = `gaban-${gabanId}`;
            socket.join(roomName);
            socket.to(roomName).emit('user-joined', {
                userId: socket.id,
                timestamp: new Date()
            });
            socket.on('disconnect', () => {
                socket.to(roomName).emit('user-left', {
                    userId: socket.id,
                    timestamp: new Date()
                });
            });
        });
    }
    // 清理方法（用于测试）
    cleanup() {
        var _a;
        (_a = this.instance) === null || _a === void 0 ? void 0 : _a.close();
        this.instance = null;
    }
}
const socket = new SocketManager();
exports.default = socket;
