import React, { useState, useEffect } from 'react';
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
import { MadameWoolfyModal } from '../../components/MadameWoolfyModal';

export const GameInProgress: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const toast = useToast();
  const [showWoolfyModal, setShowWoolfyModal] = useState(false);

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

  // Gérer l'affichage de la modal Madame Woolfy
  useEffect(() => {
    if (isEliminated || (currentPhase.type === 'END' && winners.some(w => w.id === currentPlayer?.id))) {
      setShowWoolfyModal(true);
    }
  }, [isEliminated, currentPhase.type, winners, currentPlayer?.id]);

  const handleVideoSubmit = async (recipientId: string, videoBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('video', videoBlob);
      formData.append('recipientId', recipientId);
      formData.append('gameId', gameId || '');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/woolfy-messages`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }

      toast({
        title: 'Message envoyé',
        description: 'Votre message a été transmis avec succès',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le message vidéo',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

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

      {currentPlayer && (
        <MadameWoolfyModal
          isOpen={showWoolfyModal}
          onClose={() => setShowWoolfyModal(false)}
          player={currentPlayer}
          players={players}
          isWinner={currentPhase.type === 'END' && winners.some(w => w.id === currentPlayer.id)}
          onVideoSubmit={handleVideoSubmit}
        />
      )}
    </Box>
  );
}; 