import {
  Box,
  Grid,
  GridItem,
  Text,
  useToast,
  Divider,
  VStack,
  useColorModeValue,
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

  const bgColor = useColorModeValue('whiteAlpha.200', 'rgba(10, 10, 15, 0.95)')
  const borderColor = useColorModeValue('whiteAlpha.300', 'rgba(0, 255, 242, 0.2)')

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

      messageService.markAsRead(currentConversationId).catch(console.error)
    }
  }, [currentConversationId])

  return (
    <Box h="full" maxH="calc(100vh - 100px)" overflow="hidden" px={4}>
      <Grid
        templateColumns={{ 
          base: '1fr', 
          md: '280px 1fr',
          lg: '300px minmax(600px, 1fr)',
          xl: '320px minmax(800px, 1fr)'
        }}
        gap={{ base: 4, md: 6 }}
        h="full"
        maxW="1800px"
        mx="auto"
      >
        <GridItem 
          borderWidth="1px" 
          borderRadius="lg"
          borderColor={borderColor}
          bg="rgba(0, 0, 0, 0.3)"
          overflow="hidden"
          h="full"
          maxH="full"
          display={{ base: currentConversationId ? 'none' : 'block', md: 'block' }}
        >
          <VStack align="stretch" h="full" spacing={0}>
            <Box p={4} borderBottomWidth="1px" borderColor={borderColor}>
              <Text fontSize="lg" fontWeight="bold" color="var(--color-neon)">
                Messages
              </Text>
            </Box>
            <Box flex={1} overflowY="auto">
              <ChatList />
            </Box>
          </VStack>
        </GridItem>

        <GridItem 
          borderWidth="1px" 
          borderRadius="lg"
          borderColor={borderColor}
          bg="rgba(0, 0, 0, 0.3)"
          overflow="hidden"
          h="full"
          maxH="full"
          display="flex"
          flexDirection="column"
        >
          {currentConversationId ? (
            <>
              <Box p={4} borderBottomWidth="1px" borderColor={borderColor}>
                <Text fontSize="lg" fontWeight="bold" color="var(--color-neon)">
                  {conversations.find((c) => c._id === currentConversationId)?.username}
                </Text>
              </Box>
              <Box flex={1} overflowY="auto" minH={0}>
                <ChatMessages
                  onAcceptInvite={handleAcceptInvite}
                  onRejectInvite={handleRejectInvite}
                />
              </Box>
              <Box 
                p={4} 
                borderTopWidth="1px" 
                borderColor={borderColor}
                bg="rgba(0, 0, 0, 0.2)"
              >
                <ChatInput />
              </Box>
            </>
          ) : (
            <VStack justify="center" h="full" p={4}>
              <Text color="gray.500">
                Sélectionnez une conversation pour commencer à discuter
              </Text>
            </VStack>
          )}
        </GridItem>
      </Grid>
    </Box>
  )
} 