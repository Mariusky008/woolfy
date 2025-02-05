import { GamePhaseType } from './phases';

export interface TemporaryPower {
  type: 'vote_power' | 'immunity' | 'role_peek';
  duration: number;
  description: string;
  source: string;
}

export interface WoolfyQuestion {
  id: string;
  text: string;
  phase: GamePhaseType;
  type: 'elimination' | 'standard' | 'winner';
}

export const woolfyQuestions: WoolfyQuestion[] = [
  {
    id: '1',
    text: 'Pourquoi pensez-vous avoir été éliminé ?',
    phase: 'VOTE',
    type: 'elimination'
  },
  {
    id: '2',
    text: 'Quelle a été votre stratégie pendant la partie ?',
    phase: 'DAY',
    type: 'standard'
  },
  {
    id: '3',
    text: 'Qui suspectez-vous d\'être un Piégé ?',
    phase: 'DAY',
    type: 'standard'
  },
  {
    id: '4',
    text: 'Comment vous sentez-vous après cette victoire ?',
    phase: 'END',
    type: 'winner'
  },
  {
    id: '5',
    text: 'Quel message souhaitez-vous laisser aux autres joueurs ?',
    phase: 'NIGHT',
    type: 'standard'
  }
];

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