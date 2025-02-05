import { useState, useEffect } from 'react';
import { Socket, io } from 'socket.io-client';
import { Player } from '../types/messages';
import { GamePhaseState, GamePhaseType } from '../types/gamePhases';

export const useGameState = (gameId: string) => {
  // États du joueur
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isEliminated, setIsEliminated] = useState(false);

  // États de la phase
  const [currentPhase, setCurrentPhase] = useState<GamePhaseState>({
    type: 'SETUP',
    startTime: new Date(),
    endTime: new Date(),
    remainingTime: 0,
    requirements: [],
    completedActions: [],
    canTransition: false
  });

  // États du jugement et du vote
  const [accusedPlayer, setAccusedPlayer] = useState<Player | null>(null);
  const [hasSpokenDefense, setHasSpokenDefense] = useState(false);
  const [currentVote, setCurrentVote] = useState<string | null>(null);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});

  // États de fin de partie
  const [winners, setWinners] = useState<Player[]>([]);
  const [gameStatistics, setGameStatistics] = useState({
    totalVotes: 0,
    totalEliminations: 0,
    longestDay: 0,
    mostVotedPlayer: {
      player: {} as Player,
      votes: 0
    }
  });

  // États de communication
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeConversations, setActiveConversations] = useState<string[]>([]);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('activeConversations', (conversations: string[]) => {
      setActiveConversations(conversations);
    });

    socket.on('playerEliminated', (playerId: string) => {
      if (currentPlayer && currentPlayer.id === playerId) {
        setIsEliminated(true);
      }
    });

    socket.on('phaseUpdate', (phase: GamePhaseState) => {
      setCurrentPhase(phase);
    });

    socket.on('playersUpdate', (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
      const current = updatedPlayers.find(p => p.isCurrent);
      if (current) {
        setCurrentPlayer(current);
      }
    });

    socket.on('accusedPlayerUpdate', (player: Player) => {
      setAccusedPlayer(player);
    });

    socket.on('voteUpdate', (votes: Record<string, number>) => {
      setVoteCounts(votes);
    });

    socket.on('gameEnd', ({ winners: gameWinners, statistics }) => {
      setWinners(gameWinners);
      setGameStatistics(statistics);
    });

    return () => {
      socket.off('activeConversations');
      socket.off('playerEliminated');
      socket.off('phaseUpdate');
      socket.off('playersUpdate');
      socket.off('accusedPlayerUpdate');
      socket.off('voteUpdate');
      socket.off('gameEnd');
    };
  }, [socket, currentPlayer]);

  const handleVote = async (targetId: string) => {
    if (!socket || !currentPlayer) return;
    socket.emit('vote', { targetId, gameId });
    setCurrentVote(targetId);
  };

  const handleDefenseSpeechStart = () => {
    setHasSpokenDefense(false);
    socket?.emit('defenseSpeechStart', { gameId });
  };

  const handleDefenseSpeechEnd = async (audioBlob: Blob) => {
    if (!socket) return;
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('gameId', gameId);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/defense-speech`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        setHasSpokenDefense(true);
        socket.emit('defenseSpeechEnd', { gameId });
      }
    } catch (error) {
      console.error('Error uploading defense speech:', error);
    }
  };

  return {
    // États
    players,
    currentPlayer,
    isEliminated,
    currentPhase,
    accusedPlayer,
    hasSpokenDefense,
    currentVote,
    voteCounts,
    winners,
    gameStatistics,
    activeConversations,

    // Actions
    handleVote,
    handleDefenseSpeechStart,
    handleDefenseSpeechEnd,
  };
}; 