import React from 'react';
import {
  Box,
  VStack,
  Text,
  SimpleGrid,
  Avatar,
  Badge,
  HStack,
  Icon,
  Divider,
  Heading,
  Flex,
  Progress,
} from '@chakra-ui/react';
import { FaCrown, FaSkull, FaUserSecret } from 'react-icons/fa';
import { GiWolfHowl } from 'react-icons/gi';
import { EndPhaseProps } from '../../types/gamePhases';

export const EndPhase: React.FC<EndPhaseProps> = ({
  players,
  winners,
  timeRemaining,
  statistics,
  currentPlayer,
}) => {
  const timeRemainingPercent = (timeRemaining / 300) * 100; // 300 secondes = 5 minutes

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Woolfy':
        return GiWolfHowl;
      case 'Piege':
        return FaUserSecret;
      default:
        return FaUserSecret;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Woolfy':
        return 'red';
      case 'Piege':
        return 'purple';
      default:
        return 'blue';
    }
  };

  return (
    <Box
      p={6}
      bg="gray.900"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="gold"
    >
      <VStack spacing={8}>
        <VStack spacing={2}>
          <Heading color="gold" size="xl">
            Fin de la Partie
          </Heading>
          <Progress
            value={timeRemainingPercent}
            size="sm"
            colorScheme="yellow"
            width="100%"
            borderRadius="full"
          />
        </VStack>

        <Box width="100%">
          <Heading size="md" color="gold" mb={4}>
            <HStack>
              <Icon as={FaCrown} />
              <Text>Vainqueurs</Text>
            </HStack>
          </Heading>
          <SimpleGrid columns={[2, 3, 4]} spacing={4}>
            {winners.map(player => (
              <Box
                key={player.id}
                p={4}
                bg="rgba(255, 215, 0, 0.1)"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="gold"
              >
                <VStack>
                  <Avatar
                    size="xl"
                    name={player.username}
                    src={player.avatar}
                  />
                  <Text color="white" fontWeight="bold">
                    {player.username}
                  </Text>
                  <Badge
                    colorScheme={getRoleColor(player.role || '')}
                    variant="solid"
                  >
                    <HStack spacing={1}>
                      <Icon as={getRoleIcon(player.role || '')} />
                      <Text>{player.role}</Text>
                    </HStack>
                  </Badge>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        <Divider borderColor="gray.600" />

        <Box width="100%">
          <Heading size="md" color="white" mb={4}>
            Tous les Joueurs
          </Heading>
          <SimpleGrid columns={[2, 3, 4]} spacing={4}>
            {players.map(player => (
              <Box
                key={player.id}
                p={4}
                bg="whiteAlpha.100"
                borderRadius="lg"
                borderWidth="1px"
                borderColor={winners.some(w => w.id === player.id) ? 'gold' : 'gray.600'}
              >
                <VStack>
                  <Avatar
                    size="lg"
                    name={player.username}
                    src={player.avatar}
                  />
                  <Text color="white">
                    {player.username}
                  </Text>
                  <Badge
                    colorScheme={getRoleColor(player.role || '')}
                  >
                    <HStack spacing={1}>
                      <Icon as={getRoleIcon(player.role || '')} />
                      <Text>{player.role}</Text>
                    </HStack>
                  </Badge>
                  {!player.isAlive && (
                    <Badge colorScheme="red">
                      <HStack spacing={1}>
                        <Icon as={FaSkull} />
                        <Text>Éliminé</Text>
                      </HStack>
                    </Badge>
                  )}
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        <Divider borderColor="gray.600" />

        <Box width="100%">
          <Heading size="md" color="white" mb={4}>
            Statistiques de la Partie
          </Heading>
          <SimpleGrid columns={[1, 2]} spacing={4}>
            <Box
              p={4}
              bg="whiteAlpha.100"
              borderRadius="lg"
            >
              <VStack align="start" spacing={2}>
                <Text color="gray.300">Votes totaux</Text>
                <Text color="white" fontSize="2xl">
                  {statistics.totalVotes}
                </Text>
              </VStack>
            </Box>
            <Box
              p={4}
              bg="whiteAlpha.100"
              borderRadius="lg"
            >
              <VStack align="start" spacing={2}>
                <Text color="gray.300">Éliminations</Text>
                <Text color="white" fontSize="2xl">
                  {statistics.totalEliminations}
                </Text>
              </VStack>
            </Box>
            <Box
              p={4}
              bg="whiteAlpha.100"
              borderRadius="lg"
            >
              <VStack align="start" spacing={2}>
                <Text color="gray.300">Jour le plus long</Text>
                <Text color="white" fontSize="2xl">
                  {statistics.longestDay} minutes
                </Text>
              </VStack>
            </Box>
            <Box
              p={4}
              bg="whiteAlpha.100"
              borderRadius="lg"
            >
              <VStack align="start" spacing={2}>
                <Text color="gray.300">Joueur le plus voté</Text>
                <HStack>
                  <Avatar
                    size="sm"
                    name={statistics.mostVotedPlayer.player.username}
                    src={statistics.mostVotedPlayer.player.avatar}
                  />
                  <Text color="white" fontSize="md">
                    {statistics.mostVotedPlayer.player.username}
                  </Text>
                  <Badge colorScheme="red">
                    {statistics.mostVotedPlayer.votes} votes
                  </Badge>
                </HStack>
              </VStack>
            </Box>
          </SimpleGrid>
        </Box>
      </VStack>
    </Box>
  );
}; 