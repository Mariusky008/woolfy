import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  lastActive: Date;
  status: 'online' | 'offline' | 'in_game';
  gamesPlayed: number;
  gamesWon: number;
  correctAccusations: number;
  totalAccusations: number;
  totalKills: number;
  favoriteRole: string;
  badges: string[];
  trophies: string[];
  points: number;
  rank: string;
  gameHistory: mongoose.Types.ObjectId[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
  },
  bio: {
    type: String,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'in_game'],
    default: 'offline'
  },
  gamesPlayed: {
    type: Number,
    default: 0
  },
  gamesWon: {
    type: Number,
    default: 0
  },
  correctAccusations: {
    type: Number,
    default: 0
  },
  totalAccusations: {
    type: Number,
    default: 0
  },
  totalKills: {
    type: Number,
    default: 0
  },
  favoriteRole: {
    type: String,
    default: 'Villageois'
  },
  badges: {
    type: [String],
    default: []
  },
  trophies: {
    type: [String],
    default: []
  },
  points: {
    type: Number,
    default: 0
  },
  rank: {
    type: String,
    default: 'Louveteau'
  },
  gameHistory: [{
    type: Schema.Types.ObjectId,
    ref: 'Game'
  }]
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password for login
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

export const User = mongoose.model<IUser>('User', UserSchema); 