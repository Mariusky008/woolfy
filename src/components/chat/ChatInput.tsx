import {
  HStack,
  Input,
  IconButton,
  useToast
} from '@chakra-ui/react'
import { IoSend } from 'react-icons/io5'
import { useState } from 'react'
import { useMessageStore } from '../../stores/messageStore'
import { messageService } from '../../services/MessageService'

export const ChatInput = () => {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const currentConversationId = useMessageStore((state) => state.currentConversationId)
  const toast = useToast()

  const handleSendMessage = async () => {
    if (!message.trim() || !currentConversationId) return

    setIsSending(true)
    try {
      const sentMessage = await messageService.sendMessage(currentConversationId, message.trim())
      setMessage('')
      toast({
        title: 'Message envoyé',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right'
      })
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le message',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <HStack spacing={2}>
      <Input
        placeholder="Écrivez votre message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={isSending}
      />
      <IconButton
        aria-label="Envoyer le message"
        icon={<IoSend />}
        colorScheme="blue"
        onClick={handleSendMessage}
        isLoading={isSending}
        disabled={!message.trim()}
      />
    </HStack>
  )
} 