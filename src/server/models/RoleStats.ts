import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRoleStats extends Document {
  userId: Types.ObjectId;
  role: string;
  gamesPlayed: number;
  gamesWon: number;
  kills: number;
  specialActions: number;
  lastPlayed: Date;
  accuracy: {
    correct: number;
    total: number;
  };
}

const RoleStatsSchema = new Schema<IRoleStats>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true
  },
  gamesPlayed: {
    type: Number,
    default: 0
  },
  gamesWon: {
    type: Number,
    default: 0
  },
  kills: {
    type: Number,
    default: 0
  },
  specialActions: {
    type: Number,
    default: 0
  },
  lastPlayed: {
    type: Date,
    default: Date.now
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
});

// Index composé pour rechercher rapidement les stats d'un utilisateur par rôle
RoleStatsSchema.index({ userId: 1, role: 1 }, { unique: true });

// Méthode virtuelle pour calculer le taux de victoire
RoleStatsSchema.virtual('winRate').get(function(this: IRoleStats) {
  return this.gamesPlayed > 0 ? (this.gamesWon / this.gamesPlayed) * 100 : 0;
});

// Méthode virtuelle pour calculer la précision
RoleStatsSchema.virtual('accuracyRate').get(function(this: IRoleStats) {
  return this.accuracy.total > 0 ? (this.accuracy.correct / this.accuracy.total) * 100 : 0;
});

export const RoleStats = mongoose.model<IRoleStats>('RoleStats', RoleStatsSchema); 