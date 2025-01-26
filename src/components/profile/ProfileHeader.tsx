import React from 'react'
import {
  HStack,
  VStack,
  Avatar,
  Heading,
  Tag,
  TagLeftIcon,
  TagLabel,
  Text,
  Box,
  Stack,
} from '@chakra-ui/react'
import { GiWolfHowl } from 'react-icons/gi'
import { Profile } from '../../types/profile'

interface ProfileHeaderProps {
  profile: Profile
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  return (
    <Stack
      direction={{ base: 'column', md: 'row' }}
      spacing={{ base: 4, md: 6 }}
      bg="whiteAlpha.200"
      p={{ base: 4, md: 6 }}
      borderRadius="xl"
      align={{ base: 'center', md: 'start' }}
    >
      <Avatar
        size={{ base: 'xl', md: '2xl' }}
        name={profile.username}
        src={profile.avatar}
        border="4px solid"
        borderColor="yellow.400"
      />
      <VStack align={{ base: 'center', md: 'start' }} spacing={4} flex="1">
        <Box textAlign={{ base: 'center', md: 'left' }} w="full">
          <Heading size="lg" mb={2}>{profile.username}</Heading>
          <Tag size="lg" colorScheme="yellow" mb={4}>
            <TagLeftIcon as={GiWolfHowl} />
            <TagLabel>Niveau Expert</TagLabel>
          </Tag>
          <Text color="gray.300" maxW="600px">
            {profile.bio}
          </Text>
        </Box>
      </VStack>
    </Stack>
  )
} 