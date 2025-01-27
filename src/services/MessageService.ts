import io from 'socket.io-client'
import type { ManagerOptions, Socket } from 'socket.io-client'
import { IMessage } from '../types/message'
import { IConversation } from '../types/conversation'
import { useMessageStore } from '../stores/messageStore'

class MessageService {
  private socket: Socket | null = null
  
  async connect() {
    if (this.socket?.connected) return

    const options: ManagerOptions & { withCredentials: boolean } = {
      withCredentials: true
    }

    this.socket = io(import.meta.env.VITE_API_URL, options)

    this.socket.on('connect', () => {
      useMessageStore.getState().setIsConnected(true)
    })

    this.socket.on('disconnect', () => {
      useMessageStore.getState().setIsConnected(false)
    })

    this.socket.on('new_message', (message: IMessage) => {
      useMessageStore.getState().addMessage(message)
    })

    this.socket.on('game_invite_response', (data: { messageId: string; accepted: boolean }) => {
      useMessageStore.getState().updateGameInviteStatus(data.messageId, data.accepted ? 'accepted' : 'rejected')
    })

    useMessageStore.getState().setSocket(this.socket)
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

  async sendMessage(to: string, content: string, type: 'text' | 'game_invite' = 'text', gameInvite?: { gameId: string }): Promise<IMessage> {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        to,
        content,
        type,
        gameInvite
      })
    })

    if (!response.ok) {
      throw new Error('Erreur lors de l\'envoi du message')
    }

    const { data } = await response.json()
    useMessageStore.getState().addMessage(data)
    return data
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
}

export const messageService = new MessageService()
export { useMessageStore } 