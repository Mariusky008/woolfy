import { Types } from 'mongoose'

export interface IMessage {
  _id: string
  from: Types.ObjectId | string
  fromUsername: string
  to: Types.ObjectId | string
  content: string
  timestamp: Date
  read: boolean
  type: 'text' | 'game_invite'
  gameInvite?: {
    status: 'pending' | 'accepted' | 'rejected'
  }
}

export interface IConversation {
  _id: string
  username: string
  avatar?: string
  lastMessage: {
    content: string
    timestamp: Date
    type: 'text' | 'game_invite'
  }
  unreadCount: number
} 