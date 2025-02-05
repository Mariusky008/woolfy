import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Input,
  IconButton,
  Box,
  Text,
  Avatar,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { ArrowForwardIcon, LockIcon } from '@chakra-ui/icons';
import CryptoJS from 'crypto-js';

interface NightChatMessage {
  id: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
  content: string;
  timestamp: Date;
  encryptedContent?: string;
}

interface NightChatProps {
  currentPlayer: {
    id: string;
    name: string;
    role: string;
  };
  players: {
    id: string;
    name: string;
    role: string;
    isAlive: boolean;
  }[];
  onSendMessage: (message: NightChatMessage) => void;
  messages?: NightChatMessage[];
}

const ENCRYPTION_KEY = import.meta.env.VITE_CHAT_ENCRYPTION_KEY || 'default-key';

export const NightChat: React.FC<NightChatProps> = ({
  currentPlayer,
  players,
  onSendMessage,
  messages: externalMessages = [],
}) => {
  const [messages, setMessages] = useState<NightChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    setMessages(externalMessages);
  }, [externalMessages]);

  const bgColor = useColorModeValue('gray.800', 'gray.800');
  const borderColor = useColorModeValue('purple.500', 'purple.500');

  const encryptMessage = (content: string): string => {
    return CryptoJS.AES.encrypt(content, ENCRYPTION_KEY).toString();
  };

  const decryptMessage = (encryptedContent: string): string => {
    const bytes = CryptoJS.AES.decrypt(encryptedContent, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const canAccessChat = () => {
    return ['Piege', 'Woolfy'].includes(currentPlayer.role) && players.find(p => p.id === currentPlayer.id)?.isAlive;
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && canAccessChat()) {
      const encryptedContent = encryptMessage(newMessage);
      const message: NightChatMessage = {
        id: Date.now().toString(),
        sender: currentPlayer,
        content: newMessage,
        timestamp: new Date(),
        encryptedContent,
      };

      onSendMessage(message);
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  if (!canAccessChat()) {
    return (
      <VStack
        justify="center"
        align="center"
        h="full"
        spacing={4}
        p={4}
        bg="rgba(0, 0, 0, 0.8)"
        borderRadius="md"
      >
        <LockIcon boxSize="48px" color="red.500" />
        <Text color="red.500" fontWeight="bold" textAlign="center">
          Accès restreint
        </Text>
        <Text color="gray.400" textAlign="center">
          Ce chat est réservé aux Piégés et au Woolfy pendant la phase de nuit.
          {!players.find(p => p.id === currentPlayer.id)?.isAlive && (
            <Text color="red.400" mt={2}>
              Les joueurs éliminés ne peuvent pas participer au chat de nuit.
            </Text>
          )}
        </Text>
      </VStack>
    );
  }

  return (
    <VStack h="full" spacing={4}>
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
            background: 'red.500',
            borderRadius: '4px',
          },
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            alignSelf={message.sender.id === currentPlayer.id ? 'flex-end' : 'flex-start'}
            maxW="80%"
          >
            <HStack
              spacing={2}
              bg={message.sender.id === currentPlayer.id ? 'red.900' : bgColor}
              p={3}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Avatar size="sm" name={message.sender.name} />
              <VStack align={message.sender.id === currentPlayer.id ? 'flex-end' : 'flex-start'} spacing={1}>
                <HStack>
                  <Text
                    fontSize="sm"
                    color="red.300"
                    fontWeight="bold"
                  >
                    {message.sender.name}
                  </Text>
                  <Badge colorScheme="red" fontSize="xs">
                    {message.sender.role}
                  </Badge>
                </HStack>
                <Text color="white">
                  {message.encryptedContent 
                    ? decryptMessage(message.encryptedContent)
                    : message.content
                  }
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {message.timestamp.toLocaleTimeString()}
                </Text>
              </VStack>
            </HStack>
          </Box>
        ))}
      </VStack>

      <HStack w="full">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Message privé..."
          bg="gray.800"
          border="1px solid"
          borderColor={borderColor}
          _focus={{
            borderColor: 'red.400',
            boxShadow: '0 0 0 1px red.400',
          }}
        />
        <IconButton
          aria-label="Envoyer"
          icon={<ArrowForwardIcon />}
          onClick={handleSendMessage}
          colorScheme="red"
          isDisabled={!newMessage.trim()}
        />
      </HStack>
    </VStack>
  );
}; 