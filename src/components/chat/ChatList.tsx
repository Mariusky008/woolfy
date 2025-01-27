import {
  VStack,
  HStack,
  Avatar,
  Text,
  Box,
  Badge,
  useColorModeValue
} from '@chakra-ui/react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useMessageStore } from '../../stores/messageStore'

export const ChatList = () => {
  const conversations = useMessageStore((state) => state.conversations)
  const currentConversationId = useMessageStore((state) => state.currentConversationId)
  const setCurrentConversationId = useMessageStore((state) => state.setCurrentConversationId)

  const selectedBg = useColorModeValue('gray.100', 'gray.700')

  return (
    <VStack align="stretch" spacing={0}>
      {conversations.map((conversation) => (
        <Box
          key={conversation._id}
          p={3}
          cursor="pointer"
          bg={conversation._id === currentConversationId ? selectedBg : 'transparent'}
          _hover={{ bg: selectedBg }}
          onClick={() => setCurrentConversationId(conversation._id)}
        >
          <HStack spacing={3}>
            <Avatar size="sm" name={conversation.username} src={conversation.avatar} />
            <Box flex={1}>
              <HStack justify="space-between">
                <Text fontWeight="medium">{conversation.username}</Text>
                <Text fontSize="xs" color="gray.500">
                  {format(new Date(conversation.lastMessage.timestamp), 'HH:mm', { locale: fr })}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.500" noOfLines={1}>
                  {conversation.lastMessage.content}
                </Text>
                {conversation.unreadCount > 0 && (
                  <Badge colorScheme="blue" rounded="full">
                    {conversation.unreadCount}
                  </Badge>
                )}
              </HStack>
            </Box>
          </HStack>
        </Box>
      ))}
    </VStack>
  )
} 