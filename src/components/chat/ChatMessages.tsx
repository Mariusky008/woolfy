import React, { useEffect, useRef } from 'react'
import {
  VStack,
  Box,
  Text,
  Avatar,
  Flex,
  useColorModeValue,
  Button,
  HStack,
} from '@chakra-ui/react'
import { useMessageStore } from '../../stores/messageStore'

interface Message {
  id: string
  content: string
  senderId: string
  timestamp: Date
  senderName: string
  senderAvatar?: string
  type?: 'text' | 'game_invite'
  gameData?: {
    date: string
    role: string
  }
}

interface ChatMessagesProps {
  onAcceptInvite: (messageId: string) => void
  onRejectInvite: (messageId: string) => void
}

const sampleMessages: Message[] = [
  {
    id: '1',
    content: 'Salut ! Prêt pour une partie de Loup-Garou ?',
    senderId: 'user1',
    senderName: 'Alice',
    timestamp: new Date('2024-03-10T10:00:00'),
    senderAvatar: 'https://bit.ly/dan-abramov'
  },
  {
    id: '2',
    content: 'Bien sûr ! J\'ai hâte de jouer le rôle de la Voyante 👀',
    senderId: 'currentUser',
    senderName: 'Vous',
    timestamp: new Date('2024-03-10T10:01:00')
  },
  {
    id: '3',
    content: 'Super ! Je vais créer une partie. Je t\'envoie l\'invitation dans un instant.',
    senderId: 'user1',
    senderName: 'Alice',
    timestamp: new Date('2024-03-10T10:02:00'),
    senderAvatar: 'https://bit.ly/dan-abramov'
  },
  {
    id: '4',
    type: 'game_invite',
    content: 'Invitation à une partie de Loup-Garou',
    senderId: 'user1',
    senderName: 'Alice',
    timestamp: new Date('2024-03-10T10:03:00'),
    senderAvatar: 'https://bit.ly/dan-abramov',
    gameData: {
      date: '2024-03-10',
      role: 'Voyante'
    }
  }
]

export const ChatMessages: React.FC<ChatMessagesProps> = ({ onAcceptInvite, onRejectInvite }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUserId = 'currentUser'
  const myMessageBg = 'var(--color-neon-dark)'
  const otherMessageBg = 'rgba(0, 0, 0, 0.3)'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [sampleMessages])

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const renderMessageContent = (message: Message) => {
    if (message.type === 'game_invite' && message.gameData) {
      return (
        <Box>
          <Text fontWeight="bold" mb={2}>
            {message.content}
          </Text>
          <Text mb={2}>
            Date : {new Date(message.gameData.date).toLocaleDateString('fr-FR')}
            <br />
            Rôle proposé : {message.gameData.role}
          </Text>
          <HStack spacing={2} mt={3}>
            <Button
              size="sm"
              colorScheme="green"
              onClick={() => onAcceptInvite(message.id)}
              _hover={{
                transform: 'scale(1.05)',
                bg: 'green.500',
              }}
            >
              Accepter
            </Button>
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              onClick={() => onRejectInvite(message.id)}
              _hover={{
                transform: 'scale(1.05)',
                bg: 'red.500',
                color: 'white',
              }}
            >
              Refuser
            </Button>
          </HStack>
        </Box>
      )
    }
    return <Text fontSize="md">{message.content}</Text>
  }

  return (
    <VStack
      spacing={6}
      align="stretch"
      w="full"
      h="full"
      p={6}
      overflowY="auto"
      sx={{
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0, 0, 0, 0.1)',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'var(--color-neon)',
          borderRadius: '4px',
        },
      }}
    >
      {sampleMessages.map((message) => (
        <Flex
          key={message.id}
          justify={message.senderId === currentUserId ? 'flex-end' : 'flex-start'}
          align="flex-start"
          gap={3}
          w="full"
        >
          {message.senderId !== currentUserId && (
            <Avatar
              size="md"
              name={message.senderName}
              src={message.senderAvatar}
              border="2px solid"
              borderColor="var(--color-neon)"
            />
          )}
          <Box
            maxW={{ base: "85%", md: "70%" }}
            bg={message.senderId === currentUserId ? myMessageBg : otherMessageBg}
            color="white"
            px={6}
            py={4}
            borderRadius="2xl"
            position="relative"
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.2)"
            _before={
              message.senderId === currentUserId
                ? {
                    content: '""',
                    position: 'absolute',
                    right: '-10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: '10px solid transparent',
                    borderLeftColor: myMessageBg,
                  }
                : {
                    content: '""',
                    position: 'absolute',
                    left: '-10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: '10px solid transparent',
                    borderRightColor: otherMessageBg,
                  }
            }
          >
            {message.senderId !== currentUserId && (
              <Text fontSize="sm" color="var(--color-neon)" mb={1} fontWeight="bold">
                {message.senderName}
              </Text>
            )}
            {renderMessageContent(message)}
            <Text
              fontSize="xs"
              color="gray.400"
              textAlign="right"
              mt={2}
            >
              {formatTime(message.timestamp)}
            </Text>
          </Box>
          {message.senderId === currentUserId && (
            <Avatar
              size="md"
              name={message.senderName}
              border="2px solid"
              borderColor="var(--color-neon)"
            />
          )}
        </Flex>
      ))}
      <div ref={messagesEndRef} />
    </VStack>
  )
} 