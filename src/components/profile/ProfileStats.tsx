import React from 'react'
import {
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Box,
  Text,
  Icon,
  HStack,
  Container,
  Flex,
} from '@chakra-ui/react'
import { 
  GiPerspectiveDiceSixFacesRandom, 
  GiTrophyCup, 
  GiRank3, 
  GiTargetPoster 
} from 'react-icons/gi'
import { ProfileStats as IProfileStats } from '../../types/profile'

interface ProfileStatsProps {
  stats: IProfileStats
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ stats }) => {
  const accuracy = stats.totalAccusations > 0
    ? Math.round((stats.correctAccusations / stats.totalAccusations) * 100)
    : 0;

  return (
    <Box bg="rgba(10, 10, 15, 0.95)" p={6} borderRadius="xl">
      <SimpleGrid 
        columns={{ base: 1, sm: 2, lg: 4 }} 
        spacing={6}
        alignItems="stretch"
      >
        <Box 
          className="stat-card" 
          p={6}
          minH="150px"
          borderRadius="lg"
          border="2px solid"
          borderColor="var(--color-neon)"
          bg="rgba(0, 255, 242, 0.05)"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <Stat>
            <HStack spacing={2} mb={4}>
              <Icon 
                as={GiPerspectiveDiceSixFacesRandom} 
                w={6} 
                h={6} 
                color="var(--color-neon)"
              />
              <StatLabel fontSize="md" color="gray.300">
                Parties jouées
              </StatLabel>
            </HStack>
            <StatNumber fontSize="2xl" color="var(--color-neon)">
              {stats.gamesPlayed || 0}
            </StatNumber>
            {stats.gamesPlayed === 0 && (
              <Text fontSize="sm" color="gray.500" mt={2}>
                Aucune partie jouée
              </Text>
            )}
          </Stat>
        </Box>

        <Box 
          className="stat-card" 
          p={6}
          minH="150px"
          borderRadius="lg"
          border="2px solid"
          borderColor="#4ADE80"
          bg="rgba(74, 222, 128, 0.05)"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <Stat>
            <HStack spacing={2} mb={4}>
              <Icon 
                as={GiTrophyCup} 
                w={6} 
                h={6} 
                color="#4ADE80"
              />
              <StatLabel fontSize="md" color="gray.300">
                Taux de victoire
              </StatLabel>
            </HStack>
            <StatNumber fontSize="2xl" color="#4ADE80">
              {stats.gamesPlayed > 0 ? stats.winRate : '0%'}
            </StatNumber>
            {stats.gamesPlayed === 0 && (
              <Text fontSize="sm" color="gray.500" mt={2}>
                Jouez une partie
              </Text>
            )}
          </Stat>
        </Box>

        <Box 
          className="stat-card" 
          p={6}
          minH="150px"
          borderRadius="lg"
          border="2px solid"
          borderColor="#60A5FA"
          bg="rgba(96, 165, 250, 0.05)"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <Stat>
            <HStack spacing={2} mb={4}>
              <Icon 
                as={GiRank3} 
                w={6} 
                h={6} 
                color="#60A5FA"
              />
              <StatLabel fontSize="md" color="gray.300">
                Points de réputation
              </StatLabel>
            </HStack>
            <StatNumber fontSize="2xl" color="#60A5FA">
              {stats.reputation || 0}
            </StatNumber>
            {stats.reputation === 0 && (
              <Text fontSize="sm" color="gray.500" mt={2}>
                Gagnez des points
              </Text>
            )}
          </Stat>
        </Box>

        <Box 
          className="stat-card" 
          p={6}
          minH="150px"
          borderRadius="lg"
          border="2px solid"
          borderColor="#C084FC"
          bg="rgba(192, 132, 252, 0.05)"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <Stat>
            <HStack spacing={2} mb={4}>
              <Icon 
                as={GiTargetPoster} 
                w={6} 
                h={6} 
                color="#C084FC"
              />
              <StatLabel fontSize="md" color="gray.300">
                Précision accusations
              </StatLabel>
            </HStack>
            <StatNumber fontSize="2xl" color="#C084FC">
              {accuracy}%
            </StatNumber>
            {accuracy === 0 && (
              <Text fontSize="sm" color="gray.500" mt={2}>
                Faites des accusations
              </Text>
            )}
          </Stat>
        </Box>
      </SimpleGrid>
    </Box>
  )
} 