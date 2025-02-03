import React, { createContext, useContext, useState, useEffect } from 'react';
import { GamePhase } from '../types/phases';

interface GamePhaseContextType {
  currentPhase: GamePhase;
  setCurrentPhase: (phase: GamePhase) => void;
  timeRemaining: number;
  setTimeRemaining: (time: number) => void;
}

const GamePhaseContext = createContext<GamePhaseContextType | undefined>(undefined);

export const GamePhaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPhase, setCurrentPhase] = useState<GamePhase>({
    type: 'DAY',
    name: 'Jour',
    description: 'Phase de discussion',
    duration: 300, // 5 minutes en secondes
    actions: ['vote', 'discuss']
  });

  const [timeRemaining, setTimeRemaining] = useState<number>(currentPhase.duration);

  useEffect(() => {
    setTimeRemaining(currentPhase.duration);
  }, [currentPhase]);

  return (
    <GamePhaseContext.Provider 
      value={{ 
        currentPhase, 
        setCurrentPhase,
        timeRemaining,
        setTimeRemaining
      }}
    >
      {children}
    </GamePhaseContext.Provider>
  );
};

export const useGamePhaseContext = () => {
  const context = useContext(GamePhaseContext);
  if (context === undefined) {
    throw new Error('useGamePhaseContext must be used within a GamePhaseProvider');
  }
  return context;
}; 