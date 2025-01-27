import {
  VStack,
  HStack,
  Text,
  Box,
  Button,
  Avatar,
  useColorModeValue
} from '@chakra-ui/react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useEffect, useRef } from 'react'
import { useMessageStore } from '../../stores/messageStore'
import { useAuthStore } from '../../stores/authStore'

interface ChatMessagesProps {
  onAcceptInvite: (messageId: string) => void
  onRejectInvite: (messageId: string) => void
}

export const ChatMessages = ({ onAcceptInvite, onRejectInvite }: ChatMessagesProps) => {
  const messages = useMessageStore((state) => state.messages)
  const currentUser = useAuthStore((state) => state.user)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const myMessageBg = useColorModeValue('blue.500', 'blue.600')
  const otherMessageBg = useColorModeValue('gray.100', 'gray.700')

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!currentUser) return null

  return (
    <VStack align="stretch" spacing={4} p={4}>
      {messages.map((message) => {
        const isMyMessage = message.from === currentUser._id
        const isGameInvite = message.type === 'game_invite'

        return (
          <Box
            key={message._id}
            alignSelf={isMyMessage ? 'flex-end' : 'flex-start'}
            maxW="70%"
          >
            <HStack
              spacing={2}
              align="flex-start"
              flexDirection={isMyMessage ? 'row-reverse' : 'row'}
            >
              <Avatar size="sm" name={isMyMessage ? currentUser.username : message.fromUsername} />
              <Box>
                {isGameInvite ? (
                  <Box
                    bg={otherMessageBg}
                    p={3}
                    borderRadius="lg"
                    shadow="sm"
                  >
                    <Text fontWeight="medium" mb={2}>
                      Invitation à une partie
                    </Text>
                    {message.gameInvite?.status === 'pending' && !isMyMessage && (
                      <HStack spacing={2} mt={2}>
                        <Button
                          size="sm"
                          colorScheme="green"
                          onClick={() => onAcceptInvite(message._id)}
                        >
                          Accepter
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          onClick={() => onRejectInvite(message._id)}
                        >
                          Refuser
                        </Button>
                      </HStack>
                    )}
                    {message.gameInvite?.status !== 'pending' && (
                      <Text fontSize="sm" color="gray.500">
                        Invitation {message.gameInvite?.status === 'accepted' ? 'acceptée' : 'refusée'}
                      </Text>
                    )}
                  </Box>
                ) : (
                  <Box
                    bg={isMyMessage ? myMessageBg : otherMessageBg}
                    color={isMyMessage ? 'white' : 'inherit'}
                    p={3}
                    borderRadius="lg"
                    shadow="sm"
                  >
                    <Text>{message.content}</Text>
                  </Box>
                )}
                <Text
                  fontSize="xs"
                  color="gray.500"
                  textAlign={isMyMessage ? 'right' : 'left'}
                  mt={1}
                >
                  {format(new Date(message.timestamp), 'HH:mm', { locale: fr })}
                </Text>
              </Box>
            </HStack>
          </Box>
        )
      })}
      <div ref={messagesEndRef} />
    </VStack>
  )
} 