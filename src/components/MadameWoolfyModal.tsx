import React, { useState, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Box,
  Text,
  SimpleGrid,
  Avatar,
  Icon,
  useToast
} from '@chakra-ui/react';
import { SmallCloseIcon } from '@chakra-ui/icons';
import { FaVideo } from 'react-icons/fa';
import { GiMagicSwirl } from 'react-icons/gi';
import { Player } from '../types/messages';
import { GamePhaseType } from '../types/phases';
import { WoolfyQuestion } from '../types/game';

interface MadameWoolfyModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  players: Player[];
  isWinner: boolean;
  onVideoSubmit: (recipientId: string, videoBlob: Blob) => Promise<void>;
}

const generatePersonalizedQuestion = (selectedPlayerName: string): WoolfyQuestion => {
  const questions = [
    {
      text: `Que pensez-vous du comportement de ${selectedPlayerName} durant la partie ?`,
      category: 'comportement'
    },
    {
      text: `Quels ont été les moments clés qui vous ont fait douter ou avoir confiance en ${selectedPlayerName} ?`,
      category: 'observation'
    },
    {
      text: `Si vous deviez décrire la stratégie de ${selectedPlayerName} en quelques mots, que diriez-vous ?`,
      category: 'strategie'
    },
    {
      text: `Comment ${selectedPlayerName} a-t-il/elle influencé le cours de la partie selon vous ?`,
      category: 'deduction'
    },
    {
      text: `Quel message souhaitez-vous transmettre à ${selectedPlayerName} maintenant que la partie est terminée ?`,
      category: 'comportement'
    }
  ];

  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  return {
    id: Date.now().toString(),
    text: randomQuestion.text,
    phase: 'VOTE' as GamePhaseType,
    category: randomQuestion.category as 'comportement' | 'strategie' | 'observation' | 'deduction'
  };
};

export const MadameWoolfyModal: React.FC<MadameWoolfyModalProps> = ({
  isOpen,
  onClose,
  player,
  players,
  isWinner,
  onVideoSubmit
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<WoolfyQuestion | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const [confirmSelection, setConfirmSelection] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const toast = useToast();

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayer(playerId);
    setConfirmSelection(false);
    setShowQuestion(false);
  };

  const handleConfirmSelection = () => {
    if (!selectedPlayer) return;
    
    const selectedPlayerData = players.find(p => p.id === selectedPlayer);
    if (!selectedPlayerData) return;
    
    const personalizedQuestion = generatePersonalizedQuestion(selectedPlayerData.name);
    setSelectedQuestion(personalizedQuestion);
    setConfirmSelection(true);
    setShowQuestion(true);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        await videoPreviewRef.current.play();
      }
      
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        await onVideoSubmit(selectedPlayer, videoBlob);
        videoChunksRef.current = [];
        
        // Arrêter tous les tracks de la stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        onClose();
        
        toast({
          title: "Message vidéo envoyé !",
          description: "Votre message a été envoyé avec succès.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'enregistrement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer l'enregistrement vidéo.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
    }
  };

  // Nettoyer la stream vidéo quand la modal se ferme
  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent
        bg="rgba(10, 10, 15, 0.95)"
        border="2px solid"
        borderColor="cyan.400"
        borderRadius="xl"
      >
        <ModalHeader>
          <HStack spacing={4}>
            <Icon as={GiMagicSwirl} w={8} h={8} color="cyan.400" />
            <Text>Message de Madame Woolfy</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontSize="lg" mb={4}>
                {isWinner 
                  ? "Félicitations pour votre victoire ! Madame Woolfy vous invite à partager vos impressions..."
                  : "Avant de partir, Madame Woolfy aimerait connaître votre opinion..."}
              </Text>
              
              {!confirmSelection && (
                <Box>
                  <Text mb={2}>Choisissez un joueur à qui envoyer votre message :</Text>
                  <SimpleGrid columns={[2, 3, 4]} spacing={4}>
                    {players
                      .filter(p => p.id !== player.id)
                      .map(p => (
                        <Button
                          key={p.id}
                          onClick={() => handlePlayerSelect(p.id)}
                          colorScheme={selectedPlayer === p.id ? "cyan" : "gray"}
                          variant={selectedPlayer === p.id ? "solid" : "outline"}
                          size="lg"
                          height="100px"
                          _hover={{ transform: "scale(1.05)" }}
                          transition="all 0.2s"
                        >
                          <VStack>
                            <Avatar size="sm" name={p.name} src={p.avatar} />
                            <Text fontSize="sm">{p.name}</Text>
                          </VStack>
                        </Button>
                    ))}
                  </SimpleGrid>
                  
                  <Button
                    mt={4}
                    colorScheme="cyan"
                    isDisabled={!selectedPlayer}
                    onClick={handleConfirmSelection}
                    width="full"
                  >
                    Confirmer la sélection
                  </Button>
                </Box>
              )}

              {showQuestion && selectedQuestion && (
                <VStack spacing={4} mt={4}>
                  <Box
                    p={4}
                    bg="rgba(0, 255, 242, 0.1)"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="cyan.400"
                  >
                    <Text fontSize="lg">{selectedQuestion.text}</Text>
                  </Box>

                  <Box
                    width="100%"
                    height="300px"
                    bg="black"
                    borderRadius="lg"
                    overflow="hidden"
                    position="relative"
                  >
                    <video
                      ref={videoPreviewRef}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: 'scaleX(-1)'
                      }}
                      muted
                      playsInline
                    />
                    {isRecording && (
                      <Box
                        position="absolute"
                        top={4}
                        right={4}
                        width="12px"
                        height="12px"
                        borderRadius="full"
                        bg="red.500"
                        animation="pulse 1.5s infinite"
                        sx={{
                          '@keyframes pulse': {
                            '0%': { opacity: 1, transform: 'scale(1)' },
                            '50%': { opacity: 0.5, transform: 'scale(1.2)' },
                            '100%': { opacity: 1, transform: 'scale(1)' }
                          }
                        }}
                      />
                    )}
                  </Box>
                  
                  {!isRecording ? (
                    <Button
                      leftIcon={<FaVideo />}
                      colorScheme="cyan"
                      onClick={startRecording}
                      width="full"
                    >
                      Démarrer l'enregistrement
                    </Button>
                  ) : (
                    <Button
                      leftIcon={<SmallCloseIcon />}
                      colorScheme="red"
                      onClick={stopRecording}
                      width="full"
                    >
                      Arrêter l'enregistrement
                    </Button>
                  )}
                </VStack>
              )}
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}; 