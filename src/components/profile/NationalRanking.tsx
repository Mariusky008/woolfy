import React from 'react'
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Progress,
  Icon,
  Tag,
  TagLabel,
  TagLeftIcon,
} from '@chakra-ui/react'
import { GiTrophy, GiCrown } from 'react-icons/gi'
import { ProfileRank } from '../../types/profile'

interface NationalRankingProps {
  rank: ProfileRank
}

const getTierColor = (tier: string) => {
  switch (tier.toLowerCase()) {
    case 'bronze':
      return 'orange.600'
    case 'silver':
      return 'gray.400'
    case 'gold':
      return 'yellow.400'
    case 'platinum':
      return 'cyan.400'
    case 'diamond':
      return 'blue.400'
    case 'master':
      return 'purple.400'
    case 'grandmaster':
      return 'red.400'
    default:
      return 'gray.400'
  }
}

export const NationalRanking: React.FC<NationalRankingProps> = ({ rank }) => {
  const nextTier = rank.tier === 'Diamond I' ? 'Master' : 
    rank.division === 'I' ? `${rank.tier} IV` : 
    `${rank.tier} ${String.fromCharCode(rank.division.charCodeAt(0) - 1)}`

  return (
    <Box bg="whiteAlpha.200" p={6} borderRadius="xl">
      <HStack spacing={4} mb={6}>
        <Icon as={GiCrown} w={6} h={6} color={getTierColor(rank.tier)} />
        <Heading size="md">Classement National</Heading>
      </HStack>

      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Tag size="lg" variant="subtle" colorScheme="purple">
            <TagLeftIcon as={GiTrophy} />
            <TagLabel>Rang {rank.rank.toLocaleString()}</TagLabel>
          </Tag>
          <Text fontSize="sm" color="gray.400">
            Top {((rank.rank / 100000) * 100).toFixed(2)}%
          </Text>
        </HStack>

        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontWeight="bold" color={getTierColor(rank.tier)}>
              {rank.tier} {rank.division}
            </Text>
            <Text fontSize="sm" color="gray.400">
              {rank.points} points
            </Text>
          </HStack>
          <Progress 
            value={rank.progress} 
            colorScheme="purple" 
            borderRadius="full"
            size="sm"
          />
          <Text fontSize="sm" color="gray.400" mt={1}>
            {100 - rank.progress} points jusqu'à {nextTier}
          </Text>
        </Box>

        <Box>
          <Text fontWeight="bold" mb={2}>
            {rank.season}
          </Text>
          <Text fontSize="sm" color="gray.400">
            Points gagnés cette saison : {rank.points}
          </Text>
        </Box>
      </VStack>
    </Box>
  )
} 