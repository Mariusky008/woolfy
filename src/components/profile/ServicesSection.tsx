import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Icon,
  Progress,
  Button,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Select,
  useDisclosure,
  useToast,
  Textarea,
} from '@chakra-ui/react';
import { FaGamepad, FaHandsHelping, FaStar, FaGift } from 'react-icons/fa';
import { messageService } from '../../services/MessageService';

export const ServicesSection = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedService, setSelectedService] = useState('');
  const [description, setDescription] = useState('');
  const toast = useToast();
  const userPoints = 1250; // À remplacer par les points réels de l'utilisateur

  const availableServices = [
    { name: "Cours particulier (2h)", points: 1000 },
    { name: "Aide au déménagement", points: 1000 },
    { name: "Session de coaching gaming", points: 1000 },
    { name: "iPhone reconditionné", points: 5000 },
    { name: "PC Gaming", points: 5000 },
    { name: "Stage en entreprise", points: 5000 },
    { name: "iPhone 15", points: 10000 },
    { name: "Recommandation pour un job", points: 10000 },
    { name: "Setup Gaming Complet", points: 10000 },
  ];

  const handleServiceRequest = async () => {
    const service = availableServices.find(s => s.name === selectedService);
    if (!service) return;

    if (userPoints < service.points) {
      toast({
        title: "Points insuffisants",
        description: `Il vous manque ${service.points - userPoints} points pour ce service`,
        status: "error",
        duration: 5000,
      });
      return;
    }

    try {
      // Envoyer la demande de service à tous les utilisateurs
      await messageService.broadcastServiceRequest({
        type: 'service_request',
        service: selectedService,
        points: service.points,
        description: description,
        requesterId: 'current_user_id', // À remplacer par l'ID réel de l'utilisateur
      });

      toast({
        title: "Demande envoyée",
        description: "Votre demande de service a été diffusée à la communauté",
        status: "success",
        duration: 5000,
      });
      onClose();
      setSelectedService('');
      setDescription('');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande de service",
        status: "error",
        duration: 5000,
      });
    }
  };

  const rewardTiers = [
    {
      points: 1000,
      rewards: [
        "Cours particulier (2h)",
        "Aide au déménagement",
        "Session de coaching gaming"
      ]
    },
    {
      points: 5000,
      rewards: [
        "iPhone reconditionné",
        "PC Gaming",
        "Stage en entreprise"
      ]
    },
    {
      points: 10000,
      rewards: [
        "iPhone 15",
        "Recommandation pour un job",
        "Setup Gaming Complet"
      ]
    }
  ];

  return (
    <>
      <Box
        bg="rgba(10, 10, 15, 0.95)"
        p={6}
        borderRadius="xl"
        border="1px solid"
        borderColor="purple.500"
      >
        <VStack spacing={8} align="stretch">
          {/* En-tête */}
          <Flex justify="space-between" align="center">
            <Heading size="lg" color="white">Points & Récompenses</Heading>
            <Badge colorScheme="purple" p={2} borderRadius="md" fontSize="md">
              {userPoints} points
            </Badge>
          </Flex>

          {/* Les deux façons de gagner des points */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box
              bg="whiteAlpha.100"
              p={6}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="cyan.400"
              _hover={{ transform: 'translateY(-2px)', transition: '0.2s' }}
            >
              <Flex align="center" mb={4}>
                <Icon as={FaGamepad} w={6} h={6} color="cyan.400" mr={3} />
                <Heading size="md" color="white">Gagnez en jouant</Heading>
              </Flex>
              <VStack align="start" spacing={2} color="gray.300">
                <Text>• Victoire : +100 points</Text>
                <Text>• MVP de la partie : +50 points</Text>
                <Text>• Série de 3 victoires : +200 points</Text>
              </VStack>
            </Box>

            <Box
              bg="whiteAlpha.100"
              p={6}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="green.400"
              _hover={{ transform: 'translateY(-2px)', transition: '0.2s' }}
            >
              <Flex align="center" mb={4}>
                <Icon as={FaHandsHelping} w={6} h={6} color="green.400" mr={3} />
                <Heading size="md" color="white">Entraide communautaire</Heading>
              </Flex>
              <VStack align="start" spacing={2} color="gray.300">
                <Text>• Service rendu : +200 points</Text>
                <Text>• Note 5 étoiles : +100 points bonus</Text>
                <Text>• Badge "Super Helper" : +500 points</Text>
              </VStack>
            </Box>
          </SimpleGrid>

          {/* Progression et récompenses */}
          <Box>
            <Flex align="center" mb={4}>
              <Icon as={FaGift} w={6} h={6} color="purple.400" mr={3} />
              <Heading size="md" color="white">Récompenses Exceptionnelles</Heading>
            </Flex>
            
            <VStack spacing={6}>
              {rewardTiers.map((tier, index) => (
                <Box
                  key={index}
                  w="100%"
                  bg="whiteAlpha.50"
                  p={4}
                  borderRadius="lg"
                >
                  <Flex justify="space-between" align="center" mb={2}>
                    <Badge colorScheme="purple">{tier.points} points</Badge>
                    <Progress
                      value={(userPoints / tier.points) * 100}
                      size="sm"
                      colorScheme="purple"
                      w="200px"
                      borderRadius="full"
                    />
                  </Flex>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={3}>
                    {tier.rewards.map((reward, rewardIndex) => (
                      <Flex
                        key={rewardIndex}
                        align="center"
                        bg="whiteAlpha.100"
                        p={2}
                        borderRadius="md"
                      >
                        <Icon as={FaStar} w={4} h={4} color="yellow.400" mr={2} />
                        <Text color="gray.300" fontSize="sm">{reward}</Text>
                      </Flex>
                    ))}
                  </SimpleGrid>
                </Box>
              ))}
            </VStack>
          </Box>

          <Button
            colorScheme="purple"
            size="lg"
            w="full"
            leftIcon={<FaHandsHelping />}
            onClick={onOpen}
          >
            Demander un service
          </Button>
        </VStack>
      </Box>

      {/* Modal de demande de service */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg="gray.900" borderColor="purple.500" borderWidth="1px">
          <ModalHeader color="white">Demander un service</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Box w="full">
                <Text color="gray.300" mb={2}>Sélectionnez un service</Text>
                <Select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  color="white"
                  bg="whiteAlpha.100"
                >
                  <option value="">Choisir un service</option>
                  {availableServices.map((service) => (
                    <option key={service.name} value={service.name}>
                      {service.name} - {service.points} points
                    </option>
                  ))}
                </Select>
              </Box>

              <Box w="full">
                <Text color="gray.300" mb={2}>Description de votre demande</Text>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre besoin en détail..."
                  color="white"
                  bg="whiteAlpha.100"
                />
              </Box>

              {selectedService && (
                <Flex w="full" justify="space-between" align="center">
                  <Text color="gray.300">
                    Points nécessaires: {availableServices.find(s => s.name === selectedService)?.points}
                  </Text>
                  <Badge colorScheme={userPoints >= (availableServices.find(s => s.name === selectedService)?.points || 0) ? "green" : "red"}>
                    {userPoints >= (availableServices.find(s => s.name === selectedService)?.points || 0) ? "Points suffisants" : "Points insuffisants"}
                  </Badge>
                </Flex>
              )}

              <Button
                colorScheme="purple"
                w="full"
                onClick={handleServiceRequest}
                isDisabled={!selectedService || !description || userPoints < (availableServices.find(s => s.name === selectedService)?.points || 0)}
              >
                Confirmer la demande
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}; 