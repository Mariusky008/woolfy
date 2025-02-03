import React, { useState } from 'react'
import {
  HStack,
  Input,
  IconButton,
  useToast,
} from '@chakra-ui/react'
import { IoSend } from 'react-icons/io5'
import { useMessageStore } from '../../stores/messageStore'
import { messageService } from '../../services/MessageService'

export const ChatInput = () => {
  const [message, setMessage] = useState('')
  const currentConversationId = useMessageStore((state) => state.currentConversationId)
  const toast = useToast()

  const handleSendMessage = async () => {
    if (!message.trim() || !currentConversationId) return

    try {
      await messageService.sendMessage(currentConversationId, message.trim())
      setMessage('')
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le message',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <HStack spacing={2}>
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Écrivez votre message..."
        bg="rgba(0, 0, 0, 0.2)"
        border="2px solid"
        borderColor="rgba(0, 255, 242, 0.2)"
        _hover={{
          borderColor: 'rgba(0, 255, 242, 0.3)',
        }}
        _focus={{
          borderColor: 'var(--color-neon)',
          boxShadow: '0 0 0 1px var(--color-neon)',
        }}
        color="white"
        _placeholder={{
          color: 'gray.500',
        }}
      />
      <IconButton
        aria-label="Envoyer le message"
        icon={<IoSend />}
        onClick={handleSendMessage}
        isDisabled={!message.trim()}
        colorScheme="cyan"
        bg="var(--color-neon)"
        color="black"
        _hover={{
          bg: 'var(--color-neon)',
          opacity: 0.9,
          transform: 'scale(1.05)',
        }}
        _active={{
          transform: 'scale(0.95)',
        }}
        transition="all 0.2s"
      />
    </HStack>
  )
} 