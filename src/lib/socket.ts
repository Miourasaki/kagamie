import { Namespace, Server } from 'socket.io'


class SocketManager {
  // 使用全局变量存储实例，防止热重载时丢失
  private get instance(): Server | null {
    return (global as any)._socketManagerInstance || null
  }

  private set instance(instance: Server | null) {
    (global as any)._socketManagerInstance = instance
  }

  // 初始化方法
  public init(server: any): Server {
    if (this.instance) {
      return this.instance
    }

    const io = new Server(server, {
      path: '/socket.io'
    })

    this.setupGabanNamespace(io)
    this.instance = io

    return io
  }

  // 获取实例方法
  public getInstance(): Server {
    if (!this.instance) {
      throw new Error(
        'Socket.io not initialized. Please call SocketManager.init() first.'
      )
    }
    return this.instance
  }


  private _gabanNamespace: Namespace | null = null

  public getGabanNamespace(): Namespace {
    if (!this._gabanNamespace) {
      this._gabanNamespace = this.getInstance().of('/gaban')
    }
    return this._gabanNamespace
  }

  // 画板命名空间设置
  private setupGabanNamespace(io: Server) {
    this._gabanNamespace = io.of('/gaban')

    this._gabanNamespace.on('connection', (socket) => {
      const gabanId = socket.handshake.query.gabanId
      if (!gabanId) {
        socket.disconnect(true)
        return
      }

      const roomName = `gaban-${gabanId}`
      socket.join(roomName)

      socket.to(roomName).emit('user-joined', {
        userId: socket.id,
        timestamp: new Date()
      })

      socket.on('disconnect', () => {
        socket.to(roomName).emit('user-left', {
          userId: socket.id,
          timestamp: new Date()
        })
      })
    })
  }

  // 清理方法（用于测试）
  public cleanup() {
    this.instance?.close()
    this.instance = null
  }
}
const socket = new SocketManager()

export default socket