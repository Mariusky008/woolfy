import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Input,
  IconButton,
  Box,
  Text,
  Avatar,
  useColorModeValue,
} from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isSystem?: boolean;
}

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    sender: 'Système',
    content: 'La partie commence ! Que le meilleur gagne...',
    timestamp: new Date(),
    isSystem: true,
  },
  {
    id: '2',
    sender: 'Lucas',
    content: 'Je pense que nous devrions être prudents ce soir...',
    timestamp: new Date(),
  },
  {
    id: '3',
    sender: 'Emma',
    content: 'Quelqu\'un a des soupçons ?',
    timestamp: new Date(),
  },
];

export const VillageChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');

  const bgColor = useColorModeValue('gray.800', 'gray.800');
  const borderColor = useColorModeValue('purple.500', 'purple.500');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: 'Vous',
        content: newMessage,
        timestamp: new Date(),
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <VStack h="full" spacing={4}>
      {/* Zone des messages */}
      <VStack
        flex={1}
        w="full"
        overflowY="auto"
        spacing={4}
        align="stretch"
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'purple.500',
            borderRadius: '4px',
          },
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            alignSelf={message.sender === 'Vous' ? 'flex-end' : 'flex-start'}
            maxW="80%"
          >
            <HStack
              spacing={2}
              bg={message.isSystem ? 'purple.900' : bgColor}
              p={3}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={message.isSystem ? 'purple.500' : borderColor}
            >
              {!message.isSystem && (
                <Avatar size="sm" name={message.sender} />
              )}
              <VStack align={message.sender === 'Vous' ? 'flex-end' : 'flex-start'} spacing={1}>
                <Text
                  fontSize="sm"
                  color={message.isSystem ? 'purple.300' : 'gray.300'}
                  fontWeight="bold"
                >
                  {message.sender}
                </Text>
                <Text color="white">{message.content}</Text>
              </VStack>
            </HStack>
          </Box>
        ))}
      </VStack>

      {/* Zone de saisie */}
      <HStack w="full">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Écrivez votre message..."
          bg="gray.800"
          border="1px solid"
          borderColor={borderColor}
          _focus={{
            borderColor: 'purple.400',
            boxShadow: '0 0 0 1px purple.400',
          }}
        />
        <IconButton
          aria-label="Envoyer"
          icon={<ArrowForwardIcon />}
          onClick={handleSendMessage}
          colorScheme="purple"
          isDisabled={!newMessage.trim()}
        />
      </HStack>
    </VStack>
  );
}; 