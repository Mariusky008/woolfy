import { create } from 'zustand'
import io from 'socket.io-client'
import { IMessage, IConversation } from '../types/message'
import { ChatMessage } from '../types/profile'

interface MessageState {
  // Socket.IO
  socket: ReturnType<typeof io> | null
  isConnected: boolean
  
  // Conversations
  conversations: IConversation[]
  currentConversationId: string | null
  unreadCount: number
  
  // Messages
  messages: IMessage[]
  isLoadingMessages: boolean
  
  // Actions
  setSocket: (socket: ReturnType<typeof io> | null) => void
  setIsConnected: (isConnected: boolean) => void
  setConversations: (conversations: IConversation[]) => void
  setCurrentConversationId: (id: string | null) => void
  setMessages: (messages: IMessage[]) => void
  addMessage: (message: IMessage) => void
  setIsLoadingMessages: (isLoading: boolean) => void
  updateUnreadCount: (count: number) => void
  markMessageAsRead: (messageId: string) => void
  updateGameInviteStatus: (messageId: string, status: 'accepted' | 'rejected') => void
  updateConversation: (conversationId: string, updates: Partial<IConversation>) => void
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
  messages: ChatMessage[]
}

interface MessageStore {
  conversations: Conversation[]
  currentConversationId: string | null
  setCurrentConversationId: (id: string | null) => void
  addMessage: (conversationId: string, message: ChatMessage) => void
  setMessages: (conversationId: string, messages: ChatMessage[]) => void
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
  conversations: sampleConversations,
  currentConversationId: null,
  setCurrentConversationId: (id) => set({ currentConversationId: id }),
  addMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv._id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, message],
              lastMessage: {
                content: message.content,
                timestamp: message.timestamp
              },
              unreadCount: conv.unreadCount + 1
            }
          : conv
      )
    })),
  setMessages: (conversationId, messages) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv._id === conversationId
          ? {
              ...conv,
              messages,
              lastMessage: messages[messages.length - 1]
                ? {
                    content: messages[messages.length - 1].content,
                    timestamp: messages[messages.length - 1].timestamp
                  }
                : conv.lastMessage
            }
          : conv
      )
    })),
  markAsRead: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv._id === conversationId
          ? {
              ...conv,
              unreadCount: 0,
              messages: conv.messages.map((msg) => ({ ...msg, read: true }))
            }
          : conv
      )
    }))
})) 
