import { create } from 'zustand'
import AuthService from '../services/AuthService';

interface User {
  _id: string
  username: string
  email: string
  avatar?: string
  bio?: string
  createdAt: Date
  lastActive: Date
  status: 'online' | 'offline' | 'in_game'
  gamesPlayed: number
  gamesWon: number
  correctAccusations: number
  totalAccusations: number
  totalKills: number
  favoriteRole: string
  badges: string[]
  trophies: string[]
  points: number
  rank: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setIsAuthenticated: (isAuthenticated: boolean) => void
  setIsLoading: (isLoading: boolean) => void
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setIsLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isAuthenticated: false }),
  
  checkAuth: async () => {
    try {
      const { isAuthenticated } = await AuthService.checkAuth();
      set({ isAuthenticated });
      
      if (isAuthenticated) {
        const user = await AuthService.getCurrentUser();
        set({ user });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      set({ isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  }
})); 