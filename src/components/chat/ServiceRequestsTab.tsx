import React, { useEffect, useState } from 'react';
import {
  VStack,
  Box,
  Text,
  Badge,
  Button,
  Avatar,
  Flex,
  Icon,
  useToast,
  Divider,
} from '@chakra-ui/react';
import { FaHandsHelping, FaClock } from 'react-icons/fa';
import { messageService } from '../../services/MessageService';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ServiceRequest {
  type: 'service_request';
  service: string;
  points: number;
  description: string;
  requesterId: string;
  requesterName?: string;
  requesterAvatar?: string;
  timestamp?: Date;
}

export const ServiceRequestsTab = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const toast = useToast();

  useEffect(() => {
    // S'abonner aux nouvelles demandes de service
    const unsubscribe = messageService.onServiceRequest((request) => {
      setRequests(prev => [request, ...prev]);
    });

    return () => unsubscribe();
  }, []);

  const handleAcceptRequest = async (request: ServiceRequest) => {
    try {
      await messageService.sendMessage(
        request.requesterId,
        `Je suis intéressé(e) pour répondre à votre demande de service : ${request.service}`,
        'text'
      );

      toast({
        title: "Réponse envoyée",
        description: "Le demandeur a été notifié de votre intérêt",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error sending service response:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la réponse",
        status: "error",
        duration: 5000,
      });
    }
  };

  return (
    <VStack spacing={4} align="stretch" p={4}>
      {requests.length === 0 ? (
        <Box
          p={6}
          textAlign="center"
          borderRadius="lg"
          bg="whiteAlpha.100"
        >
          <Icon as={FaHandsHelping} w={8} h={8} color="purple.400" mb={4} />
          <Text color="gray.300">
            Aucune demande de service pour le moment
          </Text>
        </Box>
      ) : (
        requests.map((request, index) => (
          <Box
            key={index}
            p={4}
            borderRadius="lg"
            bg="whiteAlpha.100"
            borderWidth="1px"
            borderColor="purple.500"
            _hover={{ transform: 'translateY(-2px)', transition: '0.2s' }}
          >
            <Flex justify="space-between" align="start" mb={3}>
              <Flex align="center" gap={3}>
                <Avatar
                  size="sm"
                  name={request.requesterName}
                  src={request.requesterAvatar}
                />
                <Box>
                  <Text color="white" fontWeight="bold">
                    {request.requesterName || "Utilisateur"}
                  </Text>
                  <Flex align="center" color="gray.400" fontSize="sm">
                    <Icon as={FaClock} w={3} h={3} mr={1} />
                    <Text>
                      {request.timestamp
                        ? formatDistanceToNow(new Date(request.timestamp), { addSuffix: true, locale: fr })
                        : "À l'instant"}
                    </Text>
                  </Flex>
                </Box>
              </Flex>
              <Badge colorScheme="purple" fontSize="sm">
                {request.points} points
              </Badge>
            </Flex>

            <Box mb={3}>
              <Text color="white" fontWeight="bold" mb={1}>
                {request.service}
              </Text>
              <Text color="gray.300">
                {request.description}
              </Text>
            </Box>

            <Divider my={3} borderColor="whiteAlpha.300" />

            <Flex justify="flex-end">
              <Button
                size="sm"
                colorScheme="purple"
                leftIcon={<FaHandsHelping />}
                onClick={() => handleAcceptRequest(request)}
              >
                Proposer mon aide
              </Button>
            </Flex>
          </Box>
        ))
      )}
    </VStack>
  );
}; 