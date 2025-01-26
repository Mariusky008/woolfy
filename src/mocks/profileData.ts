import { Profile, Friend, ChatMessage, GameInvitation, GameHistory } from '../types/profile'

export const mockProfile: Profile = {
  username: 'Jean-Philippe',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jp',
  bio: 'Passionné de jeux de rôle et de stratégie. Amateur de complots et de déductions.',
  stats: {
    gamesPlayed: 42,
    gamesWon: 28,
    totalKills: 15,
    favoriteRole: 'Loup-Garou',
    winRate: '67%',
    reputation: 85,
    correctAccusations: 30,
    totalAccusations: 40,
    totalPoints: 2750,
    nationalRank: 1337
  },
  rank: {
    current: 'Gold II',
    progress: 65,
    season: 'Saison 3',
    points: 2750,
    rank: 1337,
    tier: 'Gold',
    division: 'II'
  },
  roles: [
    {
      role: 'Loup-Garou',
      gamesPlayed: 15,
      wins: 12,
      winRate: 0.8
    },
    {
      role: 'Villageois',
      gamesPlayed: 12,
      wins: 7,
      winRate: 0.583
    },
    {
      role: 'Sorcière',
      gamesPlayed: 8,
      wins: 5,
      winRate: 0.625
    },
    {
      role: 'Voyante',
      gamesPlayed: 7,
      wins: 4,
      winRate: 0.571
    }
  ],
  badges: [
    {
      id: '1',
      name: 'Détective de l\'année',
      rarity: 'legendary',
      unlockedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Survivant',
      rarity: 'rare',
      unlockedAt: new Date('2024-01-10')
    }
  ],
  joinedAt: new Date('2024-01-01'),
  lastActive: new Date(),
  status: 'online'
}

export const mockChatContacts: Friend[] = [
  {
    id: 1,
    username: 'Bob',
    avatar: 'https://bit.ly/ryan-florence',
    status: 'online',
    lastSeen: '2024-01-19T15:30:00'
  },
  {
    id: 2,
    username: 'Charlie',
    avatar: 'https://bit.ly/sage-adebayo',
    status: 'offline',
    lastSeen: '2024-01-19T14:00:00'
  }
]

export const mockChatMessages: Record<number, ChatMessage[]> = {
  1: [
    { id: 1, from: 'Bob', content: 'Salut ! Bien joué pour la dernière partie !', timestamp: new Date('2024-01-18T10:00:00'), read: true },
    { id: 2, from: 'Vous', content: 'Merci ! Tu as bien joué aussi !', timestamp: new Date('2024-01-18T10:01:00'), read: true }
  ]
}

export const mockGameHistory: GameHistory[] = [
  {
    id: '1',
    type: 'classic',
    date: '2024-01-19',
    duration: '45min',
    role: 'Loup-Garou',
    result: 'winner',
    points: 150,
    players: [
      { id: '1', username: 'Alice', avatar: 'https://bit.ly/dan-abramov', role: 'Villageois', result: 'loser', reputation: 75 },
      { id: '2', username: 'Bob', avatar: 'https://bit.ly/ryan-florence', role: 'Loup-Garou', result: 'winner', reputation: 82 },
      { id: '3', username: 'Charlie', avatar: 'https://bit.ly/sage-adebayo', role: 'Sorcière', result: 'loser', reputation: 90 }
    ]
  },
  {
    id: '2',
    type: 'classic',
    date: '2024-01-18',
    duration: '38min',
    role: 'Villageois',
    result: 'loser',
    points: 50,
    players: [
      { id: '4', username: 'David', avatar: 'https://bit.ly/kent-c-dodds', role: 'Loup-Garou', result: 'winner', reputation: 88 },
      { id: '5', username: 'Eve', avatar: 'https://bit.ly/tioluwani-kolawole', role: 'Voyante', result: 'loser', reputation: 79 },
      { id: '6', username: 'Frank', avatar: 'https://bit.ly/prosper-baba', role: 'Villageois', result: 'loser', reputation: 85 }
    ]
  }
]

export const mockInvitations: GameInvitation[] = [
  {
    id: 1,
    from: 'David',
    avatar: 'https://bit.ly/kent-c-dodds',
    timestamp: new Date('2024-01-19T15:30:00'),
    gameHistory: {
      date: '2024-01-18',
      role: 'Loup-Garou',
      result: 'winner'
    },
    message: "Hey ! On a joué ensemble hier. Tu étais Villageois et j'étais Loup-Garou. Ça te dit de rejouer ?"
  },
  {
    id: 2,
    from: 'Alice',
    avatar: 'https://bit.ly/dan-abramov',
    timestamp: new Date('2024-01-19T14:45:00'),
    gameHistory: {
      date: '2024-01-19',
      role: 'Villageois',
      result: 'loser'
    },
    message: "Salut ! La partie d'hier était super ! On remet ça ?"
  }
] 