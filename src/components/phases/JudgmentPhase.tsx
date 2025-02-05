import React, { useState, useRef } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  HStack,
  Avatar,
  Badge,
  useToast,
  Progress,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import { JudgmentPhaseProps } from '../../types/gamePhases';

export const JudgmentPhase: React.FC<JudgmentPhaseProps> = ({
  accusedPlayer,
  currentPlayer,
  timeRemaining,
  onDefenseSpeechStart,
  onDefenseSpeechEnd,
  hasSpokenDefense,
}) => {
  const toast = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onDefenseSpeechEnd(audioBlob);
        audioChunksRef.current = [];
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      onDefenseSpeechStart();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'accéder au microphone",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      setShowConfirmation(true);
    }
  };

  const confirmStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    setShowConfirmation(false);
  };

  const isAccused = currentPlayer.id === accusedPlayer.id;
  const timeRemainingPercent = (timeRemaining / 120) * 100; // 120 secondes = 2 minutes

  return (
    <Box
      p={6}
      bg="gray.900"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="red.500"
    >
      <VStack spacing={6}>
        <Text fontSize="2xl" color="white" fontWeight="bold">
          Phase de Jugement
        </Text>

        <Progress
          value={timeRemainingPercent}
          size="sm"
          colorScheme="red"
          width="100%"
          borderRadius="full"
        />

        <Box
          p={4}
          bg="gray.800"
          borderRadius="lg"
          width="100%"
        >
          <VStack spacing={4}>
            <HStack>
              <Avatar
                size="lg"
                name={accusedPlayer.username}
                src={accusedPlayer.avatar}
              />
              <VStack align="start" spacing={1}>
                <Text color="white" fontSize="lg">
                  {accusedPlayer.username}
                </Text>
                <Badge colorScheme="red">Accusé</Badge>
              </VStack>
            </HStack>

            {isAccused ? (
              <VStack spacing={4} width="100%">
                <Text color="gray.300">
                  C'est votre moment de vous défendre. Expliquez pourquoi vous ne devriez pas être éliminé.
                </Text>
                {!hasSpokenDefense ? (
                  <Button
                    leftIcon={isRecording ? <FaStop /> : <FaMicrophone />}
                    colorScheme={isRecording ? "red" : "green"}
                    onClick={isRecording ? stopRecording : startRecording}
                    isDisabled={hasSpokenDefense}
                  >
                    {isRecording ? "Arrêter le discours" : "Commencer le discours"}
                  </Button>
                ) : (
                  <Badge colorScheme="green" p={2}>
                    Discours de défense terminé
                  </Badge>
                )}
              </VStack>
            ) : (
              <Text color="gray.300">
                Écoutez attentivement la défense de {accusedPlayer.username} avant de voter.
              </Text>
            )}
          </VStack>
        </Box>
      </VStack>

      <Modal isOpen={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader color="white">Confirmer la fin du discours</ModalHeader>
          <ModalBody>
            <Text color="gray.300">
              Êtes-vous sûr de vouloir terminer votre discours de défense ?
              Cette action est irréversible.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={confirmStopRecording}>
              Terminer le discours
            </Button>
            <Button variant="ghost" onClick={() => setShowConfirmation(false)}>
              Continuer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}; 