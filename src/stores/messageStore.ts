import { create } from 'zustand'
import type { Socket } from 'socket.io-client'
import { IMessage, IConversation } from '../types/message'
import { ChatMessage } from '../types/profile'

interface ServiceRequest {
  type: 'service_request'
  service: string
  points: number
  description: string
  requesterId: string
  requesterName?: string
  requesterAvatar?: string
  timestamp: Date
}

interface Message {
  id: string | number
  from: string
  content: string
  timestamp: string
  read: boolean
  type?: 'text' | 'game_invite' | 'service_response'
  gameData?: {
    date: string
    role: string
  }
}

interface Conversation {
  _id: string
  username: string
  avatar?: string
  lastMessage: {
    content: string
    timestamp: string
  }
  unreadCount: number
  messages: Message[]
}

interface MessageStore {
  // Socket state
  socket: Socket | null
  isConnected: boolean
  connectionError: string | null
  
  // Conversations & Messages
  conversations: Conversation[]
  currentConversationId: string | null
  serviceRequests: ServiceRequest[]
  
  // Actions
  setSocket: (socket: Socket | null) => void
  setIsConnected: (status: boolean) => void
  setConnectionError: (error: string | null) => void
  setCurrentConversationId: (id: string | null) => void
  addMessage: (message: Message) => void
  addServiceRequest: (request: ServiceRequest) => void
  removeServiceRequest: (requesterId: string, service: string) => void
  updateUnreadCount: (conversationId: string, count: number) => void
  markAsRead: (conversationId: string) => void
}

// Données d'exemple
const sampleConversations: Conversation[] = [
  {
    _id: '1',
    username: 'AlphaWolf',
    avatar: 'https://i.pravatar.cc/150?img=1',
    lastMessage: {
      content: 'Bien joué pour la dernière partie !',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 minutes ago
    },
    unreadCount: 2,
    messages: [
      {
        id: 1,
        from: 'AlphaWolf',
        content: 'Hey ! Superbe partie hier soir !',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        read: true
      },
      {
        id: 2,
        from: 'AlphaWolf',
        content: 'Ta stratégie de Loup-Garou était impressionnante',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false
      },
      {
        id: 3,
        from: 'AlphaWolf',
        content: 'Bien joué pour la dernière partie !',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        read: false
      }
    ]
  },
  {
    _id: '2',
    username: 'MysticSeer',
    avatar: 'https://i.pravatar.cc/150?img=2',
    lastMessage: {
      content: 'On rejoue ce soir ?',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 minutes ago
    },
    unreadCount: 1,
    messages: [
      {
        id: 1,
        from: 'MysticSeer',
        content: 'Bien joué pour avoir trouvé les loups !',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        read: true
      },
      {
        id: 2,
        from: 'MysticSeer',
        content: 'On rejoue ce soir ?',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        read: false
      }
    ]
  },
  {
    _id: '3',
    username: 'NightHunter',
    avatar: 'https://i.pravatar.cc/150?img=3',
    lastMessage: {
      content: 'Invitation à une partie',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
    },
    unreadCount: 0,
    messages: [
      {
        id: 1,
        from: 'NightHunter',
        content: 'Invitation à une partie',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: true,
        type: 'game_invite',
        gameData: {
          date: '2024-03-20',
          role: 'Chasseur'
        }
      }
    ]
  }
];

export const useMessageStore = create<MessageStore>((set) => ({
  // Initial state
  socket: null,
  isConnected: false,
  connectionError: null,
  conversations: sampleConversations,
  currentConversationId: null,
  serviceRequests: [],

  // Actions
  setSocket: (socket) => set({ socket }),
  setIsConnected: (status) => set({ isConnected: status, connectionError: status ? null : undefined }),
  setConnectionError: (error) => set({ connectionError: error, isConnected: false }),
  setCurrentConversationId: (id) => set({ currentConversationId: id }),
  
  addMessage: (message) => set((state) => {
    const conversationId = state.currentConversationId
    if (!conversationId) return state

    const updatedConversations = state.conversations.map(conv => {
      if (conv._id === conversationId) {
        return {
          ...conv,
          messages: [...conv.messages, message],
          lastMessage: {
            content: message.content,
            timestamp: message.timestamp
          },
          unreadCount: conv.unreadCount + 1
        }
      }
      return conv
    })

    return { conversations: updatedConversations }
  }),

  addServiceRequest: (request) => set((state) => ({
    serviceRequests: [request, ...state.serviceRequests]
  })),

  removeServiceRequest: (requesterId, service) => set((state) => ({
    serviceRequests: state.serviceRequests.filter(
      req => !(req.requesterId === requesterId && req.service === service)
    )
  })),

  updateUnreadCount: (conversationId, count) => set((state) => ({
    conversations: state.conversations.map((conv) =>
      conv._id === conversationId ? { ...conv, unreadCount: count } : conv
    )
  })),

  markAsRead: (conversationId) => set((state) => ({
    conversations: state.conversations.map((conv) =>
      conv._id === conversationId
        ? {
            ...conv,
            unreadCount: 0,
            messages: conv.messages.map((msg) => ({ ...msg, read: true }))
          }
        : conv
    )
  })),
})); 
