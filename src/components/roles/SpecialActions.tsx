import React from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { Player } from '../../types/messages';
import { ProtectorActions } from './ProtectorActions';
import { SpyActions } from './SpyActions';
import { PuppeteerActions } from './PuppeteerActions';
import { ShadowActions } from './ShadowActions';

interface SpecialActionsProps {
  players: Player[];
  currentPlayer: Player;
  currentPhase: string;
  isEliminated: boolean;
  activeConversations: string[];
}

export const SpecialActions: React.FC<SpecialActionsProps> = ({
  players,
  currentPlayer,
  currentPhase,
  isEliminated,
  activeConversations,
}) => {
  return (
    <VStack spacing={4} align="stretch">
      <ProtectorActions
        players={players}
        currentPlayer={currentPlayer}
        isNightPhase={currentPhase === 'NIGHT'}
      />
      
      <SpyActions
        players={players}
        currentPlayer={currentPlayer}
        isNightPhase={currentPhase === 'NIGHT'}
        activeConversations={activeConversations}
      />
      
      <PuppeteerActions
        players={players}
        currentPlayer={currentPlayer}
        isJudgmentPhase={currentPhase === 'JUDGMENT'}
      />
      
      <ShadowActions
        players={players}
        currentPlayer={currentPlayer}
        isEliminated={isEliminated}
      />
    </VStack>
  );
}; 