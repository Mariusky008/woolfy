export interface ProfileStats {
  gamesPlayed: number
  gamesWon: number
  totalKills: number
  favoriteRole: string
  winRate: string
  reputation: number
  correctAccusations: number
  totalAccusations: number
  totalPoints: number
  nationalRank: number
}

export interface ProfileRank {
  current: string
  progress: number
  season: string
  points: number
  rank: number
  tier: string
  division: string
}

export interface RoleStats {
  role: string
  gamesPlayed: number
  wins: number
  winRate: number
  kills?: number
  specialActions?: number
}

export interface Badge {
  id: string
  name: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  description?: string
  unlockedAt?: Date
}

export interface Profile {
  username: string
  avatar: string
  bio: string
  joinedAt: Date
  lastActive: Date
  status: 'online' | 'offline' | 'in_game'
  stats: ProfileStats
  badges: Badge[]
  rank: ProfileRank
  roles: RoleStats[]
}

export interface GameHistoryPlayer {
  id: string
  username: string
  avatar?: string
  role: string
  result: 'winner' | 'loser'
  reputation: number
}

export interface GameHistory {
  id: string
  type: 'free' | 'cash' | 'classic' | 'pro' | 'elite'
  date: string
  duration: string
  role: string
  result: 'winner' | 'loser'
  points: number
  players: GameHistoryPlayer[]
}

export interface ChatMessage {
  id: number
  from: string
  content: string
  timestamp: Date
  read: boolean
}

export interface Friend {
  id: number
  username: string
  avatar: string
  status: 'online' | 'offline' | 'in-game'
  lastSeen?: string
}

export interface GameInvitation {
  id: number
  from: string
  avatar: string
  timestamp: Date
  gameHistory: {
    date: string
    role: string
    result: string
  }
  message: string
} 