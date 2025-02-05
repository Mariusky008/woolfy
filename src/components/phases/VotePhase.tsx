import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  SimpleGrid,
  Button,
  Avatar,
  Badge,
  Progress,
  HStack,
  Icon,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';
import { FaSkull, FaVoteYea } from 'react-icons/fa';
import { VotePhaseProps } from '../../types/gamePhases';

export const VotePhase: React.FC<VotePhaseProps> = ({
  players,
  currentPlayer,
  timeRemaining,
  onVote,
  currentVote,
  voteCounts,
}) => {
  const toast = useToast();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const timeRemainingPercent = (timeRemaining / 60) * 100; // 60 secondes = 1 minute

  const handleVoteClick = (playerId: string) => {
    if (currentVote) {
      toast({
        title: "Vote déjà effectué",
        description: "Vous ne pouvez pas changer votre vote",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setSelectedPlayer(playerId);
    setShowConfirmation(true);
  };

  const confirmVote = () => {
    if (selectedPlayer) {
      onVote(selectedPlayer);
      setShowConfirmation(false);
      toast({
        title: "Vote enregistré",
        description: "Votre vote a été pris en compte",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getVotePercentage = (playerId: string): number => {
    const totalVotes = Object.values(voteCounts).reduce((a, b) => a + b, 0);
    return totalVotes === 0 ? 0 : (voteCounts[playerId] || 0) / totalVotes * 100;
  };

  return (
    <Box
      p={6}
      bg="gray.900"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="red.500"
    >
      <VStack spacing={6}>
        <HStack justify="space-between" width="100%">
          <Text fontSize="2xl" color="white" fontWeight="bold">
            Phase de Vote
          </Text>
          <Badge
            colorScheme={currentVote ? "green" : "yellow"}
            p={2}
            borderRadius="md"
          >
            {currentVote ? "Vote effectué" : "En attente de votre vote"}
          </Badge>
        </HStack>

        <Progress
          value={timeRemainingPercent}
          size="sm"
          colorScheme="red"
          width="100%"
          borderRadius="full"
        />

        <Text color="gray.300" fontSize="md">
          Choisissez un joueur à éliminer. Attention, votre vote est définitif !
        </Text>

        <SimpleGrid columns={[2, 3, 4]} spacing={4} width="100%">
          {players
            .filter(player => player.id !== currentPlayer.id && player.isAlive)
            .map(player => (
              <Button
                key={player.id}
                onClick={() => handleVoteClick(player.id)}
                isDisabled={!!currentVote}
                height="auto"
                p={4}
                display="flex"
                flexDirection="column"
                alignItems="center"
                bg={currentVote === player.id ? "red.900" : "whiteAlpha.200"}
                _hover={{
                  bg: "whiteAlpha.300",
                  transform: "scale(1.05)",
                }}
                position="relative"
              >
                <Avatar
                  size="lg"
                  name={player.username}
                  src={player.avatar}
                  mb={2}
                />
                <Text color="white" fontSize="sm">
                  {player.username}
                </Text>
                {voteCounts[player.id] > 0 && (
                  <Badge
                    position="absolute"
                    top={2}
                    right={2}
                    colorScheme="red"
                  >
                    {Math.round(getVotePercentage(player.id))}%
                  </Badge>
                )}
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
              <Icon as={FaVoteYea} />
              <Text>Confirmer votre vote</Text>
            </HStack>
          </ModalHeader>
          <ModalBody>
            {selectedPlayer && (
              <VStack spacing={4}>
                <Icon as={FaSkull} boxSize="48px" color="red.500" />
                <Text color="white" textAlign="center">
                  Voulez-vous vraiment voter contre{' '}
                  <Text as="span" fontWeight="bold" color="red.400">
                    {players.find(p => p.id === selectedPlayer)?.username}
                  </Text>
                  ?
                </Text>
                <Text color="red.300" fontSize="sm" textAlign="center">
                  Cette action est irréversible !
                </Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              leftIcon={<Icon as={FaVoteYea} />}
              onClick={confirmVote}
            >
              Confirmer le vote
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