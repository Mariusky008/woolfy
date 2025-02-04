import io from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import { IMessage } from '../types/message'
import { IConversation } from '../types/conversation'
import { useMessageStore } from '../stores/messageStore'

interface ServiceRequest {
  type: 'service_request'
  service: string
  points: number
  description: string
  requesterId: string
  requesterName?: string
  requesterAvatar?: string
  timestamp?: Date
}

class MessageService {
  private socket: Socket | null = null
  private serviceRequestCallbacks: ((request: ServiceRequest) => void)[] = []
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  
  async connect() {
    try {
      if (this.socket?.connected) {
        console.log('Socket already connected')
        return
      }

      console.log('Connecting to socket at:', this.baseUrl)
      
      this.socket = io(this.baseUrl, {
        path: '/socket.io',
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      })

      this.socket.on('connect', () => {
        console.log('Socket connected successfully')
        useMessageStore.getState().setIsConnected(true)
        useMessageStore.getState().setConnectionError(null)
      })

      this.socket.on('connect_error', (error: Error) => {
        console.error('Socket connection error:', error.message)
        useMessageStore.getState().setIsConnected(false)
        useMessageStore.getState().setConnectionError(error.message)
      })

      this.socket.on('disconnect', (reason: string) => {
        console.log('Socket disconnected:', reason)
        useMessageStore.getState().setIsConnected(false)
      })

      this.socket.on('error', (error: Error) => {
        console.error('Socket error:', error.message)
        useMessageStore.getState().setConnectionError(error.message)
      })

      this.socket.on('new_message', (message: IMessage) => {
        console.log('Received new message:', message)
        useMessageStore.getState().addMessage(message)
      })

      this.socket.on('service_request', (request: ServiceRequest) => {
        console.log('Received service request:', request)
        this.serviceRequestCallbacks.forEach(callback => callback(request))
        useMessageStore.getState().addServiceRequest({
          ...request,
          timestamp: request.timestamp ? new Date(request.timestamp) : new Date()
        })
      })

      useMessageStore.getState().setSocket(this.socket)

      return new Promise((resolve, reject) => {
        if (!this.socket) {
          reject(new Error('Socket initialization failed'))
          return
        }

        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'))
        }, 10000)

        this.socket.on('connect', () => {
          clearTimeout(timeout)
          resolve(true)
        })

        this.socket.on('connect_error', (error: Error) => {
          clearTimeout(timeout)
          reject(error)
        })
      })
    } catch (error) {
      console.error('Socket connection error:', error)
      useMessageStore.getState().setConnectionError(error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      useMessageStore.getState().setSocket(null)
      useMessageStore.getState().setIsConnected(false)
    }
  }

  async getConversations(): Promise<IConversation[]> {
    const response = await fetch('/api/messages/conversations', {
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des conversations')
    }

    const { data } = await response.json()
    useMessageStore.getState().setConversations(data)
    return data
  }

  async getMessages(userId: string): Promise<IMessage[]> {
    const response = await fetch(`/api/messages/${userId}`, {
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des messages')
    }

    const { data } = await response.json()
    useMessageStore.getState().setMessages(data)
    return data
  }

  async sendMessage(to: string, content: string, type: 'text' | 'game_invite' = 'text'): Promise<IMessage> {
    try {
      if (!this.socket?.connected) {
        console.log('Socket not connected, attempting to connect...')
        await this.connect()
      }

      console.log('Sending message:', { to, content, type })

      const response = await fetch(`${this.baseUrl}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          to,
          content,
          type
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors de l\'envoi du message')
      }

      const { data } = await response.json()
      console.log('Message sent successfully:', data)
      useMessageStore.getState().addMessage(data)
      return data
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  async markAsRead(userId: string): Promise<void> {
    const response = await fetch(`/api/messages/${userId}/read`, {
      method: 'PUT',
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Erreur lors du marquage des messages comme lus')
    }
  }

  async respondToGameInvitation(messageId: string, accept: boolean): Promise<void> {
    const response = await fetch(`/api/messages/game-invite/${messageId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ accept })
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la réponse à l\'invitation')
    }
  }

  broadcastServiceRequest(request: ServiceRequest) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        console.error('Socket not connected')
        return reject(new Error('Not connected to socket'))
      }

      console.log('Broadcasting service request:', request)

      this.socket.emit('broadcast_service_request', {
        ...request,
        timestamp: new Date()
      }, (response: { error?: string; success?: boolean }) => {
        if (response.error) {
          console.error('Error broadcasting service request:', response.error)
          reject(new Error(response.error))
        } else {
          console.log('Service request broadcasted successfully')
          resolve(response)
        }
      })
    })
  }

  onServiceRequest(callback: (request: ServiceRequest) => void) {
    this.serviceRequestCallbacks.push(callback)
    return () => {
      this.serviceRequestCallbacks = this.serviceRequestCallbacks.filter(cb => cb !== callback)
    }
  }
}

export const messageService = new MessageService()
export { useMessageStore } 