import { Player } from './messages';

export interface PhaseProps {
  currentPlayer: Player;
  timeRemaining: number;
}

export interface JudgmentPhaseProps extends PhaseProps {
  accusedPlayer: Player;
  onDefenseSpeechStart: () => void;
  onDefenseSpeechEnd: (audioBlob: Blob) => void;
  hasSpokenDefense: boolean;
}

export interface VotePhaseProps extends PhaseProps {
  players: Player[];
  onVote: (targetId: string) => void;
  currentVote: string | null;
  voteCounts: Record<string, number>;
}

export interface EndPhaseProps extends PhaseProps {
  players: Player[];
  winners: Player[];
  statistics: {
    totalVotes: number;
    totalEliminations: number;
    longestDay: number;
    mostVotedPlayer: {
      player: Player;
      votes: number;
    };
  };
}

export interface GamePhaseState {
  type: GamePhaseType;
  startTime: Date;
  endTime: Date;
  remainingTime: number;
  requirements: PhaseRequirement[];
  completedActions: PhaseAction[];
  canTransition: boolean;
}

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