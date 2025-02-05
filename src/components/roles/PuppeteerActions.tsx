import React, { useState } from 'react';
import {
  Box,
  VStack,
  Button,
  Text,
  useToast,
  Badge,
  SimpleGrid,
  Avatar,
  HStack,
  Icon,
  Divider,
} from '@chakra-ui/react';
import { GiPuppet, GiTargetArrows } from 'react-icons/gi';
import { Player } from '../../types/messages';
import { specialPowersService } from '../../services/SpecialPowersService';

interface PuppeteerActionsProps {
  players: Player[];
  currentPlayer: Player;
  isJudgmentPhase: boolean;
}

export const PuppeteerActions: React.FC<PuppeteerActionsProps> = ({
  players,
  currentPlayer,
  isJudgmentPhase,
}) => {
  const toast = useToast();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [targetPlayer, setTargetPlayer] = useState<string | null>(null);
  const canManipulate = specialPowersService.canManipulateVote();

  const handlePlayerSelect = (playerId: string) => {
    if (selectedPlayer === null) {
      setSelectedPlayer(playerId);
    } else if (targetPlayer === null) {
      setTargetPlayer(playerId);
    }
  };

  const handleManipulate = async () => {
    if (!selectedPlayer || !targetPlayer) return;

    try {
      const success = await specialPowersService.manipulateVote(selectedPlayer, targetPlayer);
      if (success) {
        toast({
          title: 'Vote manipulé',
          description: 'Le joueur votera selon votre volonté.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setSelectedPlayer(null);
        setTargetPlayer(null);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const resetSelection = () => {
    setSelectedPlayer(null);
    setTargetPlayer(null);
  };

  if (!isJudgmentPhase || currentPlayer.role !== 'Marionnettiste') {
    return null;
  }

  return (
    <Box
      p={4}
      bg="rgba(0, 0, 0, 0.8)"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="red.500"
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between" align="center">
          <Text fontSize="lg" color="red.400" fontWeight="bold">
            Manipulation de Vote
          </Text>
          {canManipulate ? (
            <Badge colorScheme="green">Disponible</Badge>
          ) : (
            <Badge colorScheme="red">Déjà utilisé</Badge>
          )}
        </HStack>

        <Text fontSize="sm" color="gray.300">
          {!selectedPlayer
            ? 'Sélectionnez le joueur à manipuler'
            : !targetPlayer
            ? 'Sélectionnez la cible du vote forcé'
            : 'Confirmez la manipulation du vote'}
        </Text>

        <SimpleGrid columns={[2, 3, 4]} spacing={4}>
          {players
            .filter(p => p.id !== currentPlayer.id && p.isAlive)
            .map(player => (
              <Button
                key={player.id}
                onClick={() => handlePlayerSelect(player.id)}
                isDisabled={!canManipulate || player.id === selectedPlayer}
                height="auto"
                p={4}
                display="flex"
                flexDirection="column"
                alignItems="center"
                bg={
                  player.id === selectedPlayer
                    ? 'red.900'
                    : player.id === targetPlayer
                    ? 'purple.900'
                    : 'whiteAlpha.200'
                }
                _hover={{
                  bg: 'whiteAlpha.300',
                  transform: 'scale(1.05)',
                }}
                position="relative"
              >
                <Avatar size="md" name={player.username} src={player.avatar} mb={2} />
                <Text fontSize="sm" color="white">
                  {player.username}
                </Text>
                {player.id === selectedPlayer && (
                  <Badge
                    position="absolute"
                    top={2}
                    right={2}
                    colorScheme="red"
                  >
                    Manipulé
                  </Badge>
                )}
                {player.id === targetPlayer && (
                  <Badge
                    position="absolute"
                    top={2}
                    right={2}
                    colorScheme="purple"
                  >
                    Cible
                  </Badge>
                )}
              </Button>
            ))}
        </SimpleGrid>

        {selectedPlayer && targetPlayer && (
          <HStack spacing={4} mt={2}>
            <Button
              colorScheme="red"
              leftIcon={<Icon as={GiPuppet} />}
              onClick={handleManipulate}
              flex={1}
            >
              Confirmer la manipulation
            </Button>
            <Button
              variant="ghost"
              onClick={resetSelection}
            >
              Annuler
            </Button>
          </HStack>
        )}

        {selectedPlayer && (
          <Box p={3} bg="whiteAlpha.100" borderRadius="md">
            <VStack align="stretch" spacing={2}>
              <HStack>
                <Icon as={GiTargetArrows} color="red.400" />
                <Text color="red.400" fontSize="sm" fontWeight="bold">
                  Manipulation en cours
                </Text>
              </HStack>
              <Text color="gray.300" fontSize="sm">
                {players.find(p => p.id === selectedPlayer)?.username} sera forcé de voter contre{' '}
                {targetPlayer
                  ? players.find(p => p.id === targetPlayer)?.username
                  : '...'}
              </Text>
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
}; 