import { create } from 'zustand';
import axios from 'axios';

interface RankingPlayer {
  userId: string;
  username: string;
  rank: string;
  points: number;
  position: number;
}

interface RankingContext {
  above: RankingPlayer[];
  user: RankingPlayer;
  below: RankingPlayer[];
}

interface RankingState {
  globalRanking: RankingPlayer[];
  totalPlayers: number;
  userContext: RankingContext | null;
  topPlayers: RankingPlayer[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchGlobalRanking: (page?: number, limit?: number) => Promise<void>;
  fetchUserContext: (userId: string, range?: number) => Promise<void>;
  fetchTopPlayersByRank: (rank: string, limit?: number) => Promise<void>;
  updateUserRank: (userId: string) => Promise<void>;
}

export const useRankingStore = create<RankingState>((set) => ({
  globalRanking: [],
  totalPlayers: 0,
  userContext: null,
  topPlayers: [],
  isLoading: false,
  error: null,

  fetchGlobalRanking: async (page = 1, limit = 100) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/api/ranking?page=${page}&limit=${limit}`);
      set({ 
        globalRanking: response.data.rankings,
        totalPlayers: response.data.total,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: 'Erreur lors de la récupération du classement global',
        isLoading: false 
      });
    }
  },

  fetchUserContext: async (userId: string, range = 5) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/api/ranking/user/${userId}/context?range=${range}`);
      set({ userContext: response.data, isLoading: false });
    } catch (error) {
      set({ 
        error: 'Erreur lors de la récupération du contexte utilisateur',
        isLoading: false 
      });
    }
  },

  fetchTopPlayersByRank: async (rank: string, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/api/ranking/rank/${rank}/top?limit=${limit}`);
      set({ topPlayers: response.data, isLoading: false });
    } catch (error) {
      set({ 
        error: 'Erreur lors de la récupération des meilleurs joueurs',
        isLoading: false 
      });
    }
  },

  updateUserRank: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      await axios.put(`/api/ranking/user/${userId}/update`);
      // Rafraîchir le contexte de l'utilisateur après la mise à jour
      const response = await axios.get(`/api/ranking/user/${userId}/context`);
      set({ userContext: response.data, isLoading: false });
    } catch (error) {
      set({ 
        error: 'Erreur lors de la mise à jour du rang',
        isLoading: false 
      });
    }
  }
})); 