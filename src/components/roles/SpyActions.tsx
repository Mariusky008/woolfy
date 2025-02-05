import React, { useState } from 'react';
import {
  Box,
  VStack,
  Button,
  Text,
  useToast,
  Badge,
  Collapse,
  HStack,
  Icon,
  Divider,
} from '@chakra-ui/react';
import { GiSpyglass, GiEyeTarget } from 'react-icons/gi';
import { Player } from '../../types/messages';
import { specialPowersService } from '../../services/SpecialPowersService';

interface SpyActionsProps {
  players: Player[];
  currentPlayer: Player;
  isNightPhase: boolean;
  activeConversations: string[];
}

interface SpiedMessage {
  content: string;
  timestamp: Date;
}

export const SpyActions: React.FC<SpyActionsProps> = ({
  players,
  currentPlayer,
  isNightPhase,
  activeConversations,
}) => {
  const toast = useToast();
  const [spiedMessages, setSpiedMessages] = useState<SpiedMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const canSpy = specialPowersService.canSpyTonight();

  const handleSpy = async (conversationId: string) => {
    if (!canSpy) {
      toast({
        title: 'Action impossible',
        description: 'Vous avez déjà espionné une conversation cette nuit.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsListening(true);
      const messages = await specialPowersService.spyConversation(conversationId);
      
      // Anonymiser les messages
      const anonymizedMessages = messages.map(msg => ({
        content: msg.content,
        timestamp: new Date(msg.timestamp),
      }));
      
      setSpiedMessages(anonymizedMessages);
      
      toast({
        title: 'Écoute activée',
        description: 'Vous interceptez maintenant les messages de cette conversation.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setIsListening(false);
    }
  };

  if (!isNightPhase || currentPlayer.role !== 'Espion') {
    return null;
  }

  return (
    <Box
      p={4}
      bg="rgba(0, 0, 0, 0.8)"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="purple.500"
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between" align="center">
          <Text fontSize="lg" color="purple.400" fontWeight="bold">
            Écoute des Conversations
          </Text>
          {canSpy ? (
            <Badge colorScheme="green">Disponible</Badge>
          ) : (
            <Badge colorScheme="red">Déjà utilisé</Badge>
          )}
        </HStack>

        <Text fontSize="sm" color="gray.300">
          Vous pouvez écouter une conversation privée entre les joueurs suspects. Les identités resteront anonymes.
        </Text>

        {activeConversations.length > 0 ? (
          <VStack spacing={3} align="stretch">
            {activeConversations.map((convId) => (
              <Button
                key={convId}
                onClick={() => handleSpy(convId)}
                isDisabled={!canSpy || isListening}
                colorScheme="purple"
                variant="outline"
                leftIcon={<Icon as={GiSpyglass} />}
                _hover={{ bg: 'whiteAlpha.100' }}
              >
                Espionner la conversation {convId}
              </Button>
            ))}
          </VStack>
        ) : (
          <Text color="gray.500" fontSize="sm" fontStyle="italic">
            Aucune conversation active à espionner pour le moment...
          </Text>
        )}

        <Collapse in={spiedMessages.length > 0}>
          <VStack spacing={3} align="stretch" mt={4}>
            <Divider borderColor="purple.500" />
            <HStack>
              <Icon as={GiEyeTarget} color="purple.400" />
              <Text color="purple.400" fontWeight="bold">
                Messages interceptés
              </Text>
            </HStack>
            
            <Box
              maxH="200px"
              overflowY="auto"
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
              {spiedMessages.map((msg, index) => (
                <Box
                  key={index}
                  p={2}
                  bg="whiteAlpha.100"
                  borderRadius="md"
                  mb={2}
                >
                  <Text color="gray.300" fontSize="sm">
                    {msg.content}
                  </Text>
                  <Text color="gray.500" fontSize="xs">
                    {msg.timestamp.toLocaleTimeString()}
                  </Text>
                </Box>
              ))}
            </Box>
          </VStack>
        </Collapse>
      </VStack>
    </Box>
  );
}; 