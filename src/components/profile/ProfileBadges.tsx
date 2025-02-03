import React from 'react'
import {
  Box,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Badge } from '../../types/profile'

interface ProfileBadgesProps {
  badges: Badge[]
}

export const ProfileBadges: React.FC<ProfileBadgesProps> = ({ badges }) => {
  return (
    <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
      {badges.map((badge) => (
        <VStack
          key={badge.id}
          p={4}
          bg="rgba(10, 10, 15, 0.95)"
          borderRadius="lg"
          border="2px solid"
          borderColor={getBadgeColor(badge.rarity)}
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: `0 0 20px ${getBadgeColor(badge.rarity)}`,
          }}
          transition="all 0.3s ease"
        >
          <Text fontWeight="bold" color={getBadgeColor(badge.rarity)}>
            {badge.name}
          </Text>
          {badge.description && (
            <Text fontSize="sm" color="gray.400" textAlign="center">
              {badge.description}
            </Text>
          )}
          <Text
            fontSize="xs"
            color={getBadgeColor(badge.rarity)}
            textTransform="uppercase"
            mt={2}
          >
            {badge.rarity}
          </Text>
        </VStack>
      ))}
    </SimpleGrid>
  )
}

const getBadgeColor = (rarity: Badge['rarity']): string => {
  switch (rarity) {
    case 'legendary':
      return 'var(--color-legendary, #FFD700)'
    case 'epic':
      return 'var(--color-epic, #A335EE)'
    case 'rare':
      return 'var(--color-rare, #0070DD)'
    default:
      return 'var(--color-common, #9D9D9D)'
  }
} 