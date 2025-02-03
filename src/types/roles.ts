export type TeamType = 'village' | 'wolf' | 'duo' | 'neutral';

export interface Role {
  name: string;
  description: string;
  team: TeamType;
  abilities: string[];
  symbol?: string;
}

export interface DuoMystere {
  id: string;
  players: [string, string];
  found: boolean;
  reward?: string;
}

export interface DuoBonus {
  type: 'vote_power' | 'immunity' | 'role_peek';
  duration: number;
  description: string;
} 