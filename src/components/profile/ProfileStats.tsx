import React from 'react'
import {
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Box,
} from '@chakra-ui/react'
import { ProfileStats as IProfileStats } from '../../types/profile'

interface ProfileStatsProps {
  stats: IProfileStats
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ stats }) => {
  return (
    <SimpleGrid 
      columns={{ base: 2, md: 2, lg: 4 }} 
      spacing={{ base: 3, md: 6 }}
      mx={{ base: -2, md: 0 }}
    >
      <Box bg="whiteAlpha.200" p={{ base: 3, md: 4 }} borderRadius="lg">
        <Stat>
          <StatLabel fontSize={{ base: 'sm', md: 'md' }}>Parties jouées</StatLabel>
          <StatNumber fontSize={{ base: 'lg', md: 'xl' }}>{stats.gamesPlayed}</StatNumber>
        </Stat>
      </Box>
      <Box bg="whiteAlpha.200" p={{ base: 3, md: 4 }} borderRadius="lg">
        <Stat>
          <StatLabel fontSize={{ base: 'sm', md: 'md' }}>Taux de victoire</StatLabel>
          <StatNumber fontSize={{ base: 'lg', md: 'xl' }} color="green.400">{stats.winRate}</StatNumber>
        </Stat>
      </Box>
      <Box bg="whiteAlpha.200" p={{ base: 3, md: 4 }} borderRadius="lg">
        <Stat>
          <StatLabel fontSize={{ base: 'sm', md: 'md' }}>Réputation</StatLabel>
          <StatNumber fontSize={{ base: 'lg', md: 'xl' }} color="blue.400">{stats.reputation}</StatNumber>
        </Stat>
      </Box>
      <Box bg="whiteAlpha.200" p={{ base: 3, md: 4 }} borderRadius="lg">
        <Stat>
          <StatLabel fontSize={{ base: 'sm', md: 'md' }}>Précision</StatLabel>
          <StatNumber fontSize={{ base: 'lg', md: 'xl' }} color="purple.400">
            {Math.round((stats.correctAccusations / stats.totalAccusations) * 100)}%
          </StatNumber>
        </Stat>
      </Box>
    </SimpleGrid>
  )
} 