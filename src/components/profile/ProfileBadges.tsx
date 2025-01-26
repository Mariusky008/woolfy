import React from 'react'
import {
  Box,
  Heading,
  Wrap,
  WrapItem,
  Tag,
  TagLeftIcon,
  TagLabel,
} from '@chakra-ui/react'
import { GiTrophyCup, GiLaurelCrown, GiDeathSkull } from 'react-icons/gi'
import { Profile } from '../../types/profile'

interface ProfileBadgesProps {
  profile: Profile
}

export const ProfileBadges: React.FC<ProfileBadgesProps> = ({ profile }) => {
  return (
    <Box bg="whiteAlpha.200" p={6} borderRadius="xl">
      <Heading size="md" mb={4}>Badges et Réalisations</Heading>
      <Wrap spacing={4}>
        <WrapItem>
          <Tag size="lg" colorScheme="purple">
            <TagLeftIcon as={GiTrophyCup} />
            <TagLabel>Expert {profile.stats.favoriteRole}</TagLabel>
          </Tag>
        </WrapItem>
        <WrapItem>
          <Tag size="lg" colorScheme="green">
            <TagLeftIcon as={GiLaurelCrown} />
            <TagLabel>Vétéran</TagLabel>
          </Tag>
        </WrapItem>
        <WrapItem>
          <Tag size="lg" colorScheme="red">
            <TagLeftIcon as={GiDeathSkull} />
            <TagLabel>Prédateur</TagLabel>
          </Tag>
        </WrapItem>
        {profile.badges.map(badge => (
          <WrapItem key={badge.id}>
            <Tag 
              size="lg" 
              colorScheme={getBadgeColorScheme(badge.rarity)}
            >
              <TagLabel>{badge.name}</TagLabel>
            </Tag>
          </WrapItem>
        ))}
      </Wrap>
    </Box>
  )
}

const getBadgeColorScheme = (rarity: string) => {
  switch (rarity) {
    case 'legendary':
      return 'yellow'
    case 'epic':
      return 'purple'
    case 'rare':
      return 'blue'
    default:
      return 'gray'
  }
} 