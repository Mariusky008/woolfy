export interface Player {
  id: string;
  username: string;
  avatar: string;
  isAlive: boolean;
  isCurrentTurn: boolean;
  isCurrent: boolean;
  description: string;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    totalKills: number;
    favoriteRole: string;
    winRate: string;
  };
  position?: number;
}

export type MessageType = 'text' | 'audio' | 'video';
export type CallType = 'audio' | 'video';
export type CallState = 'ringing' | 'connected' | 'ended';

export interface GameMessage {
  id: string;
  content: string;
  timestamp: Date;
  sender: Player;
  type: MessageType;
}

export interface UserMessage extends GameMessage {
  isPrivate?: boolean;
  recipient?: Player;
}

export interface SystemMessage extends GameMessage {
  category: 'info' | 'warning' | 'error' | 'success';
}

export interface ActiveCall {
  id: string;
  type: CallType;
  state: CallState;
  participants: Player[];
  startTime: Date;
}

export interface RecordedMessage {
  id: string;
  audioUrl: string;
  duration: number;
  timestamp: Date;
  sender: Player;
}

export interface RecordedMessages {
  [key: string]: RecordedMessage[];
} 