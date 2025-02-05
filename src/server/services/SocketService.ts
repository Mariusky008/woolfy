import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import { Types } from 'mongoose'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { Session } from 'express-session'

interface SocketUser extends Socket {
  userId?: Types.ObjectId
  session?: Session
}

export class SocketService {
  private io: Server
  private connectedUsers: Map<string, SocketUser>

  constructor(server: HttpServer, sessionMiddleware: any) {
    this.io = new Server(server, {
      cors: {
        origin: [
          'http://localhost:5173',
          'http://localhost:5175',
          'http://localhost:3001',
          'https://www.woolfy.fr',
          'https://woolfy.fr'
        ],
        methods: ['GET', 'POST'],
        credentials: true
      },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
      allowEIO3: true
    })

    this.connectedUsers = new Map()
    this.setupMiddleware(sessionMiddleware)
    this.setupEventHandlers()
  }

  private setupMiddleware(sessionMiddleware: any) {
    // Wrap the session middleware
    const wrap = (middleware: any) => (socket: Socket, next: any) => {
      middleware(socket.request, socket.request.res || {}, next)
    }

    this.io.use(wrap(sessionMiddleware))

    // Add authentication middleware
    this.io.use((socket: SocketUser, next) => {
      const session = (socket.request as any).session
      console.log('Socket middleware - Session:', session)
      
      if (!session) {
        console.log('No session found in socket connection')
        return next(new Error('Authentication error - No session'))
      }

      if (!session.userId) {
        console.log('No userId found in session')
        return next(new Error('Authentication error - No user'))
      }

      socket.session = session
      socket.userId = new Types.ObjectId(session.userId)
      next()
    })
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: SocketUser) => {
      console.log('Client connected:', {
        socketId: socket.id,
        userId: socket.userId,
        transport: socket.conn.transport.name
      })

      // Add user to connected users map
      if (socket.userId) {
        this.connectedUsers.set(socket.userId.toString(), socket)
      }
      
      socket.on('disconnect', (reason) => {
        console.log('Client disconnected:', {
          socketId: socket.id,
          userId: socket.userId,
          reason
        })
        
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId.toString())
        }
      })

      socket.on('error', (error) => {
        console.error('Socket error:', {
          socketId: socket.id,
          userId: socket.userId,
          error
        })
      })

      // Handle transport change
      socket.conn.on('upgrade', (transport) => {
        console.log('Transport upgraded:', {
          socketId: socket.id,
          transport: transport.name
        })
      })
    })

    // Handle server-side errors
    this.io.engine.on('connection_error', (err) => {
      console.error('Connection error:', err)
    })
  }

  public getIO(): Server {
    return this.io
  }

  public notifyUser(userId: string, event: string, data: any) {
    const recipientSocket = this.connectedUsers.get(userId)
    if (recipientSocket) {
      recipientSocket.emit(event, data)
      return true
    }
    return false
  }
}

// Export une instance unique
let socketService: SocketService | null = null

export function initSocketService(server: HttpServer, sessionMiddleware: any): Server {
  if (!socketService) {
    socketService = new SocketService(server, sessionMiddleware)
  }
  return socketService.getIO()
}

export function getSocketService(): SocketService {
  if (!socketService) {
    throw new Error('SocketService not initialized')
  }
  return socketService
} 