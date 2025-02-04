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

export type GamePhaseType = 'SETUP' | 'DAY' | 'DUSK' | 'NIGHT' | 'JUDGMENT' | 'VOTE' | 'END';

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  isAlive: boolean;
  score: number;
}

export const PHASE_DESCRIPTIONS: Record<GamePhaseType, string> = {
  SETUP: "Les joueurs reçoivent leurs rôles et peuvent commencer à discuter. N'oubliez pas d'envoyer au moins une vidéo !",
  DAY: "Débattez, bluffez et tentez de démasquer les traîtres. Une vidéo obligatoire par phase !",
  DUSK: "Le soleil se couche, préparez-vous pour la nuit...",
  NIGHT: "Les Woolfys et les rôles spéciaux agissent dans l'ombre...",
  JUDGMENT: "Le joueur le plus suspect doit se défendre. Votez pour décider de son sort !",
  VOTE: "C'est l'heure du vote final !",
  END: "La partie est terminée. Qui sont les vainqueurs ?"
};

export interface WoolfyQuestion {
  id: string;
  text: string;
  phase: GamePhaseType;
  category: 'comportement' | 'strategie' | 'observation' | 'deduction';
}

export interface WoolfyInterview {
  id: string;
  playerId: string;
  questionId: string;
  videoUrl: string;
  timestamp: Date;
  phase: GamePhaseType;
  recipientId: string;
  isResponse: boolean;
  parentInterviewId?: string;
} 