import React from 'react'
import {
  VStack,
  HStack,
  Text,
  Avatar,
  Box,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react'
import { useMessageStore } from '../../stores/messageStore'

interface Conversation {
  id: string
  username: string
  avatar?: string
  lastMessage: string
  timestamp: Date
  unreadCount: number
}

const sampleConversations: Conversation[] = [
  {
    id: '1',
    username: 'Alice',
    avatar: 'https://bit.ly/dan-abramov',
    lastMessage: 'Salut ! Prêt pour une partie de Loup-Garou ?',
    timestamp: new Date('2024-03-10T10:00:00'),
    unreadCount: 2,
  },
  {
    id: '2',
    username: 'Bob',
    avatar: 'https://bit.ly/ryan-florence',
    lastMessage: 'GG pour la dernière partie !',
    timestamp: new Date('2024-03-09T23:45:00'),
    unreadCount: 0,
  },
  {
    id: '3',
    username: 'Charlie',
    avatar: 'https://bit.ly/prosper-baba',
    lastMessage: 'On remet ça quand tu veux !',
    timestamp: new Date('2024-03-09T22:30:00'),
    unreadCount: 1,
  },
  {
    id: '4',
    username: 'Diana',
    avatar: 'https://bit.ly/code-beast',
    lastMessage: 'Bien joué en tant que Voyante !',
    timestamp: new Date('2024-03-09T20:15:00'),
    unreadCount: 0,
  },
]

export const ChatList = () => {
  const setCurrentConversationId = useMessageStore((state) => state.setCurrentConversationId)
  const currentConversationId = useMessageStore((state) => state.currentConversationId)
  const hoverBg = useColorModeValue('gray.100', 'rgba(0, 255, 242, 0.1)')
  const selectedBg = useColorModeValue('gray.200', 'rgba(0, 255, 242, 0.2)')

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    } else if (days === 1) {
      return 'Hier'
    } else if (days < 7) {
      return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
      }).format(date)
    } else {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
      }).format(date)
    }
  }

  return (
    <VStack spacing={0} align="stretch" w="full">
      {sampleConversations.map((conversation) => (
        <Box
          key={conversation.id}
          p={4}
          cursor="pointer"
          bg={currentConversationId === conversation.id ? selectedBg : 'transparent'}
          _hover={{
            bg: currentConversationId === conversation.id ? selectedBg : hoverBg,
          }}
          transition="background-color 0.2s"
          onClick={() => setCurrentConversationId(conversation.id)}
          position="relative"
          borderBottom="1px solid"
          borderColor={useColorModeValue('gray.200', 'rgba(0, 255, 242, 0.1)')}
        >
          <HStack spacing={3} align="start">
            <Avatar
              size="md"
              name={conversation.username}
              src={conversation.avatar}
              border="2px solid"
              borderColor={conversation.unreadCount > 0 ? 'var(--color-neon)' : 'transparent'}
            />
            <Box flex={1} overflow="hidden">
              <HStack justify="space-between" mb={1}>
                <Text
                  fontWeight="bold"
                  color={conversation.unreadCount > 0 ? 'var(--color-neon)' : undefined}
                >
                  {conversation.username}
                </Text>
                <Text
                  fontSize="xs"
                  color="gray.500"
                >
                  {formatTime(conversation.timestamp)}
                </Text>
              </HStack>
              <Text
                fontSize="sm"
                color={conversation.unreadCount > 0 ? 'white' : 'gray.500'}
                noOfLines={2}
              >
                {conversation.lastMessage}
              </Text>
            </Box>
            {conversation.unreadCount > 0 && (
              <Badge
                colorScheme="cyan"
                bg="var(--color-neon)"
                color="black"
                borderRadius="full"
                px={2}
                fontSize="xs"
              >
                {conversation.unreadCount}
              </Badge>
            )}
          </HStack>
        </Box>
      ))}
    </VStack>
  )
} 