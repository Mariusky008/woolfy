import mongoose, { Schema, Document } from 'mongoose';

export interface IBadge extends Document {
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: {
    type: 'games_played' | 'win_rate' | 'kills' | 'accuracy' | 'special_actions';
    value: number;
  };
  category: 'achievement' | 'role' | 'season' | 'event';
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
  icon: {
    type: String,
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    required: true
  },
  requirements: {
    type: {
      type: String,
      enum: ['games_played', 'win_rate', 'kills', 'accuracy', 'special_actions'],
      required: true
    },
    value: {
      type: Number,
      required: true
    }
  },
  category: {
    type: String,
    enum: ['achievement', 'role', 'season', 'event'],
    required: true
  }
});

export const Badge = mongoose.model<IBadge>('Badge', BadgeSchema); 