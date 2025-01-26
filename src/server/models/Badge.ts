import mongoose, { Schema, Document } from 'mongoose';

export interface IBadge extends Document {
  name: string;
  description: string;
  type: 'badge' | 'trophy';
  category: 'game_type' | 'achievement' | 'special';
  imageUrl?: string;
  requirements: {
    gameType?: string;
    minGamesPlayed?: number;
    minGamesWon?: number;
    minPoints?: number;
    specialCondition?: string;
  };
  pointsValue: number;
}

const BadgeSchema = new Schema<IBadge>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['badge', 'trophy'],
    required: true
  },
  category: {
    type: String,
    enum: ['game_type', 'achievement', 'special'],
    required: true
  },
  imageUrl: {
    type: String
  },
  requirements: {
    gameType: String,
    minGamesPlayed: Number,
    minGamesWon: Number,
    minPoints: Number,
    specialCondition: String
  },
  pointsValue: {
    type: Number,
    required: true
  }
});

export const Badge = mongoose.model<IBadge>('Badge', BadgeSchema); 