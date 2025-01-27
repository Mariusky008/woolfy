import {
  Box,
  Grid,
  GridItem,
  Text,
  useToast,
  Divider,
  VStack
} from '@chakra-ui/react'
import { useEffect } from 'react'
import { useMessageStore } from '../../stores/messageStore'
import { messageService } from '../../services/MessageService'
import { ChatList } from './ChatList'
import { ChatMessages } from './ChatMessages'
import { ChatInput } from './ChatInput'

export const Chat = () => {
  const currentConversationId = useMessageStore((state) => state.currentConversationId)
  const conversations = useMessageStore((state) => state.conversations)
  const toast = useToast()

  const handleAcceptInvite = async (messageId: string) => {
    try {
      await messageService.respondToGameInvitation(messageId, true)
      toast({
        title: 'Invitation acceptée',
        status: 'success',
        duration: 3000
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de répondre à l\'invitation',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    }
  }

  const handleRejectInvite = async (messageId: string) => {
    try {
      await messageService.respondToGameInvitation(messageId, false)
      toast({
        title: 'Invitation refusée',
        status: 'info',
        duration: 3000
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de répondre à l\'invitation',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    }
  }

  // Charger les messages quand une conversation est sélectionnée
  useEffect(() => {
    if (currentConversationId) {
      messageService.getMessages(currentConversationId).catch((error) => {
        console.error('Erreur lors du chargement des messages:', error)
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les messages',
          status: 'error',
          duration: 5000,
          isClosable: true
        })
      })

      // Marquer les messages comme lus
      messageService.markAsRead(currentConversationId).catch(console.error)
    }
  }, [currentConversationId])

  return (
    <Grid
      templateColumns={{ base: '1fr', md: '300px 1fr' }}
      gap={4}
      h="full"
    >
      <GridItem borderWidth="1px" borderRadius="lg" overflow="hidden">
        <VStack align="stretch" h="full">
          <Box p={4} borderBottomWidth="1px">
            <Text fontSize="lg" fontWeight="bold">
              Messages
            </Text>
          </Box>
          <Box flex={1} overflowY="auto">
            <ChatList />
          </Box>
        </VStack>
      </GridItem>

      <GridItem borderWidth="1px" borderRadius="lg" overflow="hidden">
        {currentConversationId ? (
          <VStack align="stretch" h="full">
            <Box p={4} borderBottomWidth="1px">
              <Text fontSize="lg" fontWeight="bold">
                {conversations.find((c) => c._id === currentConversationId)?.username}
              </Text>
            </Box>
            <Box flex={1} overflowY="auto">
              <ChatMessages
                onAcceptInvite={handleAcceptInvite}
                onRejectInvite={handleRejectInvite}
              />
            </Box>
            <Divider />
            <Box p={2}>
              <ChatInput />
            </Box>
          </VStack>
        ) : (
          <VStack justify="center" h="full" p={4}>
            <Text color="gray.500">
              Sélectionnez une conversation pour commencer à discuter
            </Text>
          </VStack>
        )}
      </GridItem>
    </Grid>
  )
} 