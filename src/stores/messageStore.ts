import { create } from 'zustand'
import io from 'socket.io-client'
import { IMessage, IConversation } from '../types/message'

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

export const useMessageStore = create<MessageState>((set) => ({
  // État initial
  socket: null,
  isConnected: false,
  conversations: [],
  currentConversationId: null,
  messages: [],
  isLoadingMessages: false,
  unreadCount: 0,
  
  // Actions
  setSocket: (socket) => set({ socket }),
  
  setIsConnected: (isConnected) => set({ isConnected }),
  
  setConversations: (conversations) => set({ conversations }),
  
  setCurrentConversationId: (id) => set({ currentConversationId: id }),
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
    unreadCount: message.to === state.currentConversationId ? state.unreadCount : state.unreadCount + 1
  })),
  
  setIsLoadingMessages: (isLoading) => set({ isLoadingMessages: isLoading }),
  
  updateUnreadCount: (count) => set({ unreadCount: count }),
  
  markMessageAsRead: (messageId) => set((state) => ({
    messages: state.messages.map(msg => 
      msg._id === messageId ? { ...msg, read: true } : msg
    )
  })),
  
  updateGameInviteStatus: (messageId, status) => set((state) => ({
    messages: state.messages.map(msg =>
      msg._id === messageId && msg.type === 'game_invite' && msg.gameInvite
        ? {
            ...msg,
            gameInvite: {
              ...msg.gameInvite,
              status
            }
          }
        : msg
    )
  })),
  
  updateConversation: (conversationId, updates) => set((state) => ({
    conversations: state.conversations.map((conv) =>
      conv._id === conversationId ? { ...conv, ...updates } : conv
    )
  })),
})) 
