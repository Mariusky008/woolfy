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
import { GiDeathSkull, GiGrimReaper } from 'react-icons/gi';
import { Player } from '../../types/messages';
import { specialPowersService } from '../../services/SpecialPowersService';

interface ShadowActionsProps {
  players: Player[];
  currentPlayer: Player;
  isEliminated: boolean;
}

export const ShadowActions: React.FC<ShadowActionsProps> = ({
  players,
  currentPlayer,
  isEliminated,
}) => {
  const toast = useToast();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const canUseVengeance = specialPowersService.canUseVengeance();

  const handleTargetSelect = (playerId: string) => {
    setSelectedTarget(playerId);
    setShowConfirmation(true);
  };

  const handleVengeance = async () => {
    if (!selectedTarget) return;

    try {
      const success = await specialPowersService.useVengeance(selectedTarget);
      if (success) {
        toast({
          title: 'Vengeance activée',
          description: 'Votre victime vous accompagnera dans la mort...',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setShowConfirmation(false);
        setSelectedTarget(null);
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

  if (!isEliminated || currentPlayer.role !== 'Ombre' || !canUseVengeance) {
    return null;
  }

  return (
    <>
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
              Vengeance Mortelle
            </Text>
            <Badge colorScheme="red" variant="solid">
              Dernière Action
            </Badge>
          </HStack>

          <Text fontSize="sm" color="gray.300">
            Vous avez été éliminé. Choisissez un joueur qui vous accompagnera dans la mort.
          </Text>

          <SimpleGrid columns={[2, 3, 4]} spacing={4}>
            {players
              .filter(p => p.id !== currentPlayer.id && p.isAlive)
              .map(player => (
                <Button
                  key={player.id}
                  onClick={() => handleTargetSelect(player.id)}
                  height="auto"
                  p={4}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  bg="whiteAlpha.200"
                  _hover={{
                    bg: 'red.900',
                    transform: 'scale(1.05)',
                  }}
                  position="relative"
                >
                  <Avatar size="md" name={player.username} src={player.avatar} mb={2} />
                  <Text fontSize="sm" color="white">
                    {player.username}
                  </Text>
                </Button>
              ))}
          </SimpleGrid>
        </VStack>
      </Box>

      <Modal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        isCentered
      >
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent
          bg="gray.900"
          borderWidth="1px"
          borderColor="red.500"
          boxShadow="0 0 20px rgba(229, 62, 62, 0.4)"
        >
          <ModalHeader color="red.400">
            <HStack>
              <Icon as={GiGrimReaper} />
              <Text>Confirmer la Vengeance</Text>
            </HStack>
          </ModalHeader>
          <ModalBody>
            {selectedTarget && (
              <VStack spacing={4}>
                <Icon as={GiDeathSkull} boxSize="48px" color="red.500" />
                <Text color="white" textAlign="center">
                  Êtes-vous sûr de vouloir emmener{' '}
                  <Text as="span" fontWeight="bold" color="red.400">
                    {players.find(p => p.id === selectedTarget)?.username}
                  </Text>{' '}
                  avec vous dans la mort ?
                </Text>
                <Text fontSize="sm" color="gray.400" textAlign="center">
                  Cette action est irréversible.
                </Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              leftIcon={<Icon as={GiDeathSkull} />}
              onClick={handleVengeance}
            >
              Confirmer la Vengeance
            </Button>
            <Button variant="ghost" onClick={() => setShowConfirmation(false)}>
              Annuler
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}; 