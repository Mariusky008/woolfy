import React, { useEffect } from 'react'
import {
  VStack,
  Box,
  Text,
  Avatar,
  Flex,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useMessageStore } from '../../stores/messageStore'
import { messageService } from '../../services/MessageService'

export const ConversationsList: React.FC = () => {
  const conversations = useMessageStore((state) => state.conversations)
  const currentConversationId = useMessageStore((state) => state.currentConversationId)
  const setCurrentConversationId = useMessageStore((state) => state.setCurrentConversationId)
  
  const bgHover = useColorModeValue('gray.100', 'whiteAlpha.100')
  const selectedBg = useColorModeValue('gray.200', 'whiteAlpha.200')

  useEffect(() => {
    const loadConversations = async () => {
      try {
        await messageService.getConversations()
      } catch (error) {
        console.error('Error loading conversations:', error)
      }
    }

    loadConversations()
  }, [])

  const handleConversationClick = async (conversationId: string) => {
    setCurrentConversationId(conversationId)
    try {
      await messageService.markAsRead(conversationId)
    } catch (error) {
      console.error('Error marking conversation as read:', error)
    }
  }

  return (
    <VStack spacing={0} align="stretch" w="100%" overflow="auto" maxH="calc(100vh - 200px)">
      {conversations.map((conversation) => (
        <Box
          key={conversation._id}
          p={4}
          cursor="pointer"
          bg={currentConversationId === conversation._id ? selectedBg : 'transparent'}
          _hover={{ bg: bgHover }}
          borderBottom="1px solid"
          borderColor="whiteAlpha.200"
          onClick={() => handleConversationClick(conversation._id)}
        >
          <Flex align="center" justify="space-between">
            <Flex align="center" gap={3}>
              <Avatar
                size="sm"
                name={conversation.username}
                src={conversation.avatar}
              />
              <Box>
                <Text color="white" fontWeight="bold">
                  {conversation.username}
                </Text>
                <Text color="gray.400" fontSize="sm" noOfLines={1}>
                  {conversation.lastMessage.content}
                </Text>
              </Box>
            </Flex>
            <Flex direction="column" align="flex-end" gap={1}>
              <Text color="gray.500" fontSize="xs">
                {formatDistanceToNow(new Date(conversation.lastMessage.timestamp), {
                  addSuffix: true,
                  locale: fr
                })}
              </Text>
              {conversation.unreadCount > 0 && (
                <Badge colorScheme="purple" borderRadius="full">
                  {conversation.unreadCount}
                </Badge>
              )}
            </Flex>
          </Flex>
        </Box>
      ))}
    </VStack>
  )
} 