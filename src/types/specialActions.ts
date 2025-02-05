import { Player } from './messages';

export interface ProtectionAction {
  protector: Player;
  target: Player;
  night: number;
}

export interface SpyAction {
  spy: Player;
  targetConversation: string;
  night: number;
}

export interface ManipulationAction {
  puppeteer: Player;
  target: Player;
  forcedVote: Player;
}

export interface VengeanceAction {
  shadow: Player;
  target: Player;
  chainKill: boolean;
}

export interface SpecialActionEvent {
  type: 'PROTECT' | 'SPY' | 'MANIPULATE' | 'VENGEANCE';
  action: ProtectionAction | SpyAction | ManipulationAction | VengeanceAction;
  timestamp: number;
}

export interface SpecialActionResponse {
  success: boolean;
  message: string;
  data?: any;
} 