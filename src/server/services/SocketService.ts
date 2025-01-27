import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import { Types } from 'mongoose'

interface SocketUser extends Socket {
  userId?: Types.ObjectId
}

export class SocketService {
  private io: Server
  private connectedUsers: Map<string, SocketUser>

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? 'https://www.woolfy.fr'
          : 'http://localhost:5173',
        credentials: true
      }
    })

    this.connectedUsers = new Map()
    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: SocketUser) => {
      console.log('Nouvelle connexion socket')

      socket.on('authenticate', (userId: string) => {
        socket.userId = new Types.ObjectId(userId)
        this.connectedUsers.set(userId, socket)
        console.log(`Utilisateur ${userId} authentifié`)
      })

      socket.on('new_message', (data: { to: string, content: string, type: string }) => {
        const recipientSocket = this.connectedUsers.get(data.to)
        if (recipientSocket) {
          recipientSocket.emit('receive_message', {
            from: socket.userId,
            content: data.content,
            type: data.type,
            timestamp: new Date()
          })
        }
      })

      socket.on('game_invite_response', (data: { messageId: string, accepted: boolean }) => {
        this.io.emit('game_invite_updated', {
          messageId: data.messageId,
          accepted: data.accepted
        })
      })

      socket.on('disconnect', () => {
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId.toString())
          console.log(`Utilisateur ${socket.userId} déconnecté`)
        }
      })
    })
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

export function initSocketService(httpServer: HttpServer) {
  if (!socketService) {
    socketService = new SocketService(httpServer)
  }
  return socketService
}

export function getSocketService() {
  if (!socketService) {
    throw new Error('SocketService not initialized')
  }
  return socketService
} 