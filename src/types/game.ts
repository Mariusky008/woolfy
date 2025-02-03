import { GamePhase } from './phases';
import { Player } from './messages';
import { Role } from './roles';

export interface TemporaryPower {
  type: 'vote_power' | 'immunity' | 'role_peek';
  duration: number;
  description: string;
  source: string;
}

export interface GamePhaseConfig {
  duration: number;
  allowedActions: string[];
  specialRules?: string[];
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  totalKills: number;
  favoriteRole: string;
  winRate: string;
}

export const gamePhases: Record<string, GamePhaseConfig> = {
  DAY: {
    duration: 300,
    allowedActions: ['vote', 'chat', 'use_power'],
  },
  NIGHT: {
    duration: 120,
    allowedActions: ['wolf_vote', 'use_power', 'private_chat'],
  },
  VOTE: {
    duration: 60,
    allowedActions: ['vote', 'chat'],
  },
  DUSK: {
    duration: 30,
    allowedActions: ['chat'],
  },
  DAWN: {
    duration: 30,
    allowedActions: ['chat'],
  }
}; 