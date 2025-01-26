import { IMessage } from './message'

export interface IConversation {
  _id: string
  username: string
  avatar?: string
  lastMessage: IMessage
  unreadCount: number
} 