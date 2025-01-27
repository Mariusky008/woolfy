import mongoose, { Schema, Document } from 'mongoose'

export interface IMessage extends Document {
  from: mongoose.Types.ObjectId
  to: mongoose.Types.ObjectId
  content: string
  type: 'text' | 'game_invite'
  timestamp: Date
  read: boolean
  gameInvite?: {
    gameId: mongoose.Types.ObjectId
    status: 'pending' | 'accepted' | 'rejected'
  }
}

const MessageSchema = new Schema<IMessage>({
  from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'game_invite'], default: 'text' },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  gameInvite: {
    gameId: { type: Schema.Types.ObjectId, ref: 'Game' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'] }
  }
})

// Index pour optimiser les requêtes
MessageSchema.index({ from: 1, to: 1, timestamp: -1 })
MessageSchema.index({ to: 1, read: 1 })

export const Message = mongoose.model<IMessage>('Message', MessageSchema) 