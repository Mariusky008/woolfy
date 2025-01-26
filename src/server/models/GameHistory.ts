import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGameHistory extends Document {
  gameId: Types.ObjectId;
  type: 'free' | 'cash' | 'classic' | 'pro' | 'elite';
  date: Date;
  duration: number; // en minutes
  players: Array<{
    userId: Types.ObjectId;
    username: string;
    avatar?: string;
    role: string;
    result: 'winner' | 'loser';
    kills: number;
    specialActions: number;
    accuracy: {
      correct: number;
      total: number;
    };
  }>;
  events: Array<{
    type: 'kill' | 'vote' | 'special_action';
    timestamp: Date;
    actor: Types.ObjectId;
    target?: Types.ObjectId;
    description: string;
  }>;
  points: {
    base: number;
    bonus: number;
    total: number;
  };
}

const GameHistorySchema = new Schema<IGameHistory>({
  gameId: {
    type: Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  type: {
    type: String,
    enum: ['free', 'cash', 'classic', 'pro', 'elite'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  players: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    avatar: String,
    role: {
      type: String,
      required: true
    },
    result: {
      type: String,
      enum: ['winner', 'loser'],
      required: true
    },
    kills: {
      type: Number,
      default: 0
    },
    specialActions: {
      type: Number,
      default: 0
    },
    accuracy: {
      correct: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        default: 0
      }
    }
  }],
  events: [{
    type: {
      type: String,
      enum: ['kill', 'vote', 'special_action'],
      required: true
    },
    timestamp: {
      type: Date,
      required: true
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    target: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    description: {
      type: String,
      required: true
    }
  }],
  points: {
    base: {
      type: Number,
      required: true
    },
    bonus: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  }
});

// Index pour rechercher rapidement l'historique d'un joueur
GameHistorySchema.index({ 'players.userId': 1 });

// Index pour trier par date
GameHistorySchema.index({ date: -1 });

export const GameHistory = mongoose.model<IGameHistory>('GameHistory', GameHistorySchema); 