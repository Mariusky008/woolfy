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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';
import { GiShieldReflect, GiShield } from 'react-icons/gi';
import { Player } from '../../types/messages';
import { specialPowersService } from '../../services/SpecialPowersService';

interface ProtectorActionsProps {
  players: Player[];
  currentPlayer: Player;
  isNightPhase: boolean;
}

export const ProtectorActions: React.FC<ProtectorActionsProps> = ({
  players,
  currentPlayer,
  isNightPhase,
}) => {
  const toast = useToast();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const canProtect = specialPowersService.hasUsedAbilityThisNight(currentPlayer);

  const handlePlayerSelect = (playerId: string) => {
    if (!canProtect) {
      setSelectedPlayer(playerId);
      setShowConfirmation(true);
    } else {
      toast({
        title: 'Action impossible',
        description: 'Vous avez déjà protégé quelqu\'un cette nuit.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleProtect = async () => {
    if (!selectedPlayer) return;

    try {
      const targetPlayer = players.find(p => p.id === selectedPlayer);
      if (!targetPlayer) return;

      const response = await specialPowersService.protectPlayer(currentPlayer, targetPlayer);
      
      if (response.success) {
        toast({
          title: 'Protection activée',
          description: `${targetPlayer.username} est maintenant sous votre protection.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setShowConfirmation(false);
        setSelectedPlayer(null);
      } else {
        throw new Error(response.message);
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

  if (!isNightPhase || currentPlayer.role !== 'Protecteur') {
    return null;
  }

  return (
    <Box
      p={4}
      bg="rgba(0, 0, 0, 0.8)"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="cyan.500"
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between" align="center">
          <Text fontSize="lg" color="cyan.400" fontWeight="bold">
            Protection Nocturne
          </Text>
          {canProtect ? (
            <Badge colorScheme="red">Déjà utilisé</Badge>
          ) : (
            <Badge colorScheme="green">Disponible</Badge>
          )}
        </HStack>

        <Text fontSize="sm" color="gray.300">
          Choisissez un joueur à protéger pendant la nuit. Cette personne ne pourra pas être éliminée.
        </Text>

        <SimpleGrid columns={[2, 3, 4]} spacing={4}>
          {players
            .filter(p => p.id !== currentPlayer.id && p.isAlive)
            .map(player => (
              <Button
                key={player.id}
                onClick={() => handlePlayerSelect(player.id)}
                isDisabled={canProtect}
                height="auto"
                p={4}
                display="flex"
                flexDirection="column"
                alignItems="center"
                bg={player.id === selectedPlayer ? "cyan.900" : "whiteAlpha.200"}
                _hover={{
                  bg: "whiteAlpha.300",
                  transform: "scale(1.05)",
                }}
              >
                <Avatar size="md" name={player.username} src={player.avatar} mb={2} />
                <Text fontSize="sm" color="white">
                  {player.username}
                </Text>
              </Button>
            ))}
        </SimpleGrid>
      </VStack>

      <Modal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        isCentered
      >
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg="gray.800">
          <ModalHeader color="white">
            <HStack>
              <Icon as={GiShieldReflect} />
              <Text>Confirmer la protection</Text>
            </HStack>
          </ModalHeader>
          <ModalBody>
            {selectedPlayer && (
              <VStack spacing={4}>
                <Icon as={GiShield} boxSize="48px" color="cyan.500" />
                <Text color="white" textAlign="center">
                  Voulez-vous vraiment protéger{' '}
                  <Text as="span" fontWeight="bold" color="cyan.400">
                    {players.find(p => p.id === selectedPlayer)?.username}
                  </Text>
                  ?
                </Text>
                <Text color="gray.400" fontSize="sm" textAlign="center">
                  Cette personne sera immunisée contre toute élimination cette nuit.
                </Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="cyan"
              mr={3}
              leftIcon={<Icon as={GiShieldReflect} />}
              onClick={handleProtect}
            >
              Confirmer la protection
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowConfirmation(false)}
            >
              Annuler
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}; 