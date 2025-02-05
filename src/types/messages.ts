export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  totalKills: number;
  favoriteRole: string;
  winRate: string;
}

export interface Player {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  role?: string;
  isAlive: boolean;
  score: number;
  isCurrent?: boolean;
  isCurrentTurn?: boolean;
  description?: string;
  stats?: PlayerStats;
  position?: number;
}

export interface GameMessage {
  id: string;
  content: string;
  timestamp: Date;
  type: 'system' | 'user' | 'role';
  from?: string;
  to?: string;
}

export interface UserMessage extends GameMessage {
  type: 'user';
  from: string;
  to?: string;
}

export interface SystemMessage extends GameMessage {
  type: 'system';
}

export type MessageType = 'text' | 'audio' | 'video';

export type CallType = 'audio' | 'video';

export type CallState = 'ringing' | 'connected' | 'ended';

export interface ActiveCall {
  type: CallType;
  from: string;
  to: string;
  state: CallState;
  startTime?: Date;
  endTime?: Date;
}

export interface RecordedMessage {
  id: string;
  type: MessageType;
  content: string | Blob;
  from: string;
  timestamp: Date;
}

export type RecordedMessages = Record<string, RecordedMessage[]>; 