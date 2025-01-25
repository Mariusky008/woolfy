import mongoose, { Schema, Document } from 'mongoose';

export interface IGame extends Document {
  name: string;
  type: 'free' | 'cash' | 'classic' | 'pro' | 'elite';
  players: {
    current: number;
    max: number;
    min: number;
    registered: mongoose.Types.ObjectId[];
  };
  startTime: string | 'auto';
  duration: string;
  prize?: string;
  rank?: string;
  status: 'waiting' | 'starting' | 'in_progress' | 'finished';
  rewards: {
    badge?: string;
    trophy?: string;
    points?: number;
  };
  createdAt: Date;
  scheduledFor?: Date;
  autoStart: boolean;
  minPlayersToStart: number; // 70% du minimum requis
}

const GameSchema = new Schema<IGame>({
  name: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['free', 'cash', 'classic', 'pro', 'elite']
  },
  players: {
    current: { type: Number, default: 0 },
    max: { type: Number, required: true },
    min: { type: Number, required: true },
    registered: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  startTime: { type: String, required: true },
  duration: { type: String, required: true },
  prize: String,
  rank: String,
  status: { 
    type: String, 
    required: true,
    enum: ['waiting', 'starting', 'in_progress', 'finished'],
    default: 'waiting'
  },
  rewards: {
    badge: String,
    trophy: String,
    points: Number
  },
  createdAt: { type: Date, default: Date.now },
  scheduledFor: Date,
  autoStart: { type: Boolean, default: false },
  minPlayersToStart: { type: Number, required: true }
});

// Middleware pre-save pour calculer le nombre minimum de joueurs (70%)
GameSchema.pre('save', function(next) {
  if (this.isNew) {
    this.minPlayersToStart = Math.ceil(this.players.min * 0.7);
  }
  next();
});

export const Game = mongoose.model<IGame>('Game', GameSchema); 