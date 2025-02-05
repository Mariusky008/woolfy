import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  VStack,
  Container,
  Text,
  useToast,
} from '@chakra-ui/react';
import { GamePhaseType } from '../../types/gamePhases';
import { JudgmentPhase } from '../../components/phases/JudgmentPhase';
import { VotePhase } from '../../components/phases/VotePhase';
import { EndPhase } from '../../components/phases/EndPhase';
import { SpecialActions } from '../../components/roles/SpecialActions';
import { useGameState } from '../../hooks/useGameState';

export const GameInProgress: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const toast = useToast();

  const {
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
    handleVote,
    handleDefenseSpeechStart,
    handleDefenseSpeechEnd,
  } = useGameState(gameId || '');

  const renderPhaseActions = (phaseType: GamePhaseType) => {
    if (!currentPlayer) return null;

    switch (phaseType) {
      case 'JUDGMENT':
        return accusedPlayer && (
          <JudgmentPhase
            accusedPlayer={accusedPlayer}
            currentPlayer={currentPlayer}
            timeRemaining={currentPhase.remainingTime}
            onDefenseSpeechStart={handleDefenseSpeechStart}
            onDefenseSpeechEnd={handleDefenseSpeechEnd}
            hasSpokenDefense={hasSpokenDefense}
          />
        );
      case 'VOTE':
        return (
          <VotePhase
            players={players}
            currentPlayer={currentPlayer}
            timeRemaining={currentPhase.remainingTime}
            onVote={handleVote}
            currentVote={currentVote}
            voteCounts={voteCounts}
          />
        );
      case 'END':
        return (
          <EndPhase
            players={players}
            currentPlayer={currentPlayer}
            winners={winners}
            timeRemaining={currentPhase.remainingTime}
            statistics={gameStatistics}
          />
        );
      default:
        return null;
    }
  };

  if (!currentPlayer) {
    return (
      <Container maxW="container.xl" centerContent>
        <VStack spacing={4} mt={8}>
          <Text>Chargement de la partie...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Box>
      <Container maxW="container.xl">
        <VStack spacing={4}>
          {renderPhaseActions(currentPhase.type)}
          
          <Box mt={4}>
            <SpecialActions
              players={players}
              currentPlayer={currentPlayer}
              currentPhase={currentPhase.type}
              isEliminated={isEliminated}
              activeConversations={activeConversations}
            />
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}; 