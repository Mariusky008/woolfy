export type GamePhaseType = 'SETUP' | 'DAY' | 'DUSK' | 'NIGHT' | 'JUDGMENT' | 'VOTE' | 'END';

export interface PhaseRequirement {
  type: 'video' | 'vote' | 'action';
  completed: boolean;
  description: string;
}

export interface PhaseAction {
  type: 'vote' | 'chat' | 'use_power' | 'video_message' | 'piege_vote' | 'private_chat' | 'defense_speech' | 'video_intro';
  target?: string;
  content?: any;
}

export interface GamePhase {
  type: GamePhaseType;
  startTime: Date;
  endTime: Date;
  remainingTime: number;
}

export interface PhaseState extends GamePhase {
  requirements: PhaseRequirement[];
  completedActions: PhaseAction[];
  canTransition: boolean;
}

export interface GamePhaseConfig {
  duration: number;
  allowedActions: PhaseAction['type'][];
  specialRules?: string[];
}

export const gamePhases: Record<GamePhaseType, GamePhaseConfig> = {
  SETUP: {
    duration: 300, // 5 minutes
    allowedActions: ['chat', 'video_intro'],
    specialRules: ['must_record_video']
  },
  DAY: {
    duration: 300, // 5 minutes
    allowedActions: ['vote', 'chat', 'use_power', 'video_message'],
    specialRules: ['must_record_daily_video']
  },
  DUSK: {
    duration: 60, // 1 minute
    allowedActions: ['chat'],
    specialRules: ['prepare_for_night']
  },
  NIGHT: {
    duration: 180, // 3 minutes
    allowedActions: ['piege_vote', 'use_power', 'private_chat'],
    specialRules: ['roles_only']
  },
  JUDGMENT: {
    duration: 120, // 2 minutes
    allowedActions: ['defense_speech', 'chat', 'vote'],
    specialRules: ['accused_can_defend']
  },
  VOTE: {
    duration: 60, // 1 minute
    allowedActions: ['vote', 'chat'],
    specialRules: ['no_vote_change']
  },
  END: {
    duration: 300, // 5 minutes
    allowedActions: ['chat', 'video_message'],
    specialRules: ['reveal_roles']
  }
};

export const PHASE_NAMES: Record<GamePhaseType, string> = {
  SETUP: 'Configuration',
  DAY: 'Jour',
  DUSK: 'Crépuscule',
  NIGHT: 'Nuit',
  JUDGMENT: 'Jugement',
  VOTE: 'Vote',
  END: 'Fin de partie'
};

export const PHASE_DESCRIPTIONS: Record<GamePhaseType, string> = {
  SETUP: "Les joueurs ont reçu leurs rôles et ont 5 minutes pour faire connaissance. Prenez le temps d'enregistrer votre vidéo de présentation et de regarder celles des autres joueurs.",
  DAY: "Débattez, bluffez et tentez de démasquer les traîtres. Une vidéo obligatoire par phase !",
  DUSK: "Le soleil se couche, préparez-vous pour la nuit...",
  NIGHT: "Les Woolfys et les rôles spéciaux agissent dans l'ombre...",
  JUDGMENT: "Le joueur le plus suspect doit se défendre. Votez pour décider de son sort !",
  VOTE: "C'est l'heure du vote final !",
  END: "La partie est terminée. Qui sont les vainqueurs ?"
};

export interface PhaseTransition {
  from: GamePhaseType;
  to: GamePhaseType;
  condition: 'time' | 'vote_complete' | 'action_complete' | 'manual';
}

export const PHASE_TRANSITIONS: PhaseTransition[] = [
  { from: 'SETUP', to: 'DAY', condition: 'time' },
  { from: 'DAY', to: 'DUSK', condition: 'time' },
  { from: 'DUSK', to: 'NIGHT', condition: 'time' },
  { from: 'NIGHT', to: 'DAY', condition: 'action_complete' },
  { from: 'DAY', to: 'JUDGMENT', condition: 'vote_complete' },
  { from: 'JUDGMENT', to: 'VOTE', condition: 'time' },
  { from: 'VOTE', to: 'NIGHT', condition: 'vote_complete' },
  { from: 'VOTE', to: 'END', condition: 'manual' }
]; 