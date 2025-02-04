import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box,
  Text,
  VStack,
  Button,
  useToast,
  IconButton,
  HStack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  Tag,
  TagLabel,
  TagLeftIcon,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Input,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Progress,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Avatar,
  Circle,
  Tooltip,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Wrap,
  WrapItem,
  Icon,
  UnorderedList,
  ListItem,
  Tabs,
  TabList,
  Tab,
  Heading,
  Select,
  Container,
  Grid,
  GridItem,
  useDisclosure,
  Badge,
  chakra,
  Spacer,
} from '@chakra-ui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { GiMagicSwirl, GiNotebook, GiWolfHowl, GiTrophyCup, GiLaurelCrown, GiDeathSkull, GiMoonBats, GiSun, GiWoodenChair } from 'react-icons/gi'
import { TimeIcon, ChatIcon, PhoneIcon, ViewIcon, CloseIcon, SmallCloseIcon } from '@chakra-ui/icons'
import { FaVideo, FaMicrophone, FaComments, FaUser } from 'react-icons/fa'
import { useGamePhaseContext } from '../../contexts/GamePhaseContext'
import { GamePhase, GamePhaseType, PHASE_NAMES, PHASE_DESCRIPTIONS } from '../../types/phases'
import MessageRecorder from '../../components/MessageRecorder'
import { VillageChat } from '../../components/VillageChat'
import { 
  GameMessage,
  UserMessage,
  SystemMessage,
  CallType,
  MessageType,
  CallState,
  ActiveCall,
  RecordedMessage,
  RecordedMessages,
  Player
} from '../../types/messages'
import {
  TemporaryPower,
  GamePhaseConfig,
  PlayerStats,
  gamePhases
} from '../../types/game'
import {
  Role,
  DuoMystere,
  DuoBonus
} from '../../types/roles'

// Importer MediaRecorder depuis le type global
declare global {
  interface Window {
    MediaRecorder: typeof MediaRecorder;
  }
}

const prenoms = [
  "Lucas", "Emma", "Gabriel", "Louise", "Hugo",
  "Alice", "Arthur", "Léa", "Jules", "Chloé",
  "Louis", "Inès", "Paul", "Sarah", "Thomas",
  "Jade", "Nathan", "Camille", "Maxime", "Zoé"
];

interface MiniGame {
  type: 'quick_debate' | 'rapid_fire' | 'memory_test'
  description: string
  participants: string[]
  winner?: string
  reward: 'vote_power' | 'immunity' | 'role_peek'
}

interface Timer {
  minutes: number
  seconds: number
  total: number
}

interface MessageIndicator {
  type: MessageType
  from: string
  to: string
  timestamp: number
  active: boolean
}

interface PlayerPosition {
  x: number
  y: number
  targetId?: string
}

interface PlayerModal {
  isOpen: boolean
  player: Player | null
}

interface PlayerRole {
  name: string;
  description: string;
  team: 'assis' | 'pieges' | 'woolfy';
  abilities: string[];
}

const roles: Record<string, PlayerRole> = {
  'Assis': {
    name: 'Assis',
    description: 'Survivez et démasquez les traîtres qui ont piégé les chaises.',
    team: 'assis',
    abilities: ['Vote diurne', 'Communication publique', 'Observation']
  },
  'Piege': {
    name: 'Piégé',
    description: 'Éliminez les Assis sans vous faire repérer. Vous pouvez communiquer secrètement avec les autres Piégés.',
    team: 'pieges',
    abilities: [
      'Communication secrète entre Piégés',
      'Élimination nocturne',
      'Vote diurne'
    ]
  },
  'Woolfy': {
    name: 'Woolfy',
    description: 'Chasseur solitaire qui peut traquer et découvrir l\'identité des autres joueurs, mais attention à ne pas vous faire repérer !',
    team: 'woolfy',
    abilities: [
      'La Traque - Découvrir si un joueur est Piégé ou Assis',
      'Communication secrète avec certains joueurs',
      'Risque d\'être repéré si utilisation excessive des pouvoirs'
    ]
  },
  'Protecteur': {
    name: 'Protecteur',
    description: 'Protégez un joueur chaque nuit de l\'attaque des Piégés.',
    team: 'assis',
    abilities: [
      'Protection nocturne',
      'Ne peut pas protéger la même personne deux nuits de suite'
    ]
  },
  'Espion': {
    name: 'Espion',
    description: 'Écoutez une conversation privée entre Piégés sans connaître leur identité.',
    team: 'assis',
    abilities: [
      'Écoute des conversations privées',
      'Anonymat des conversations écoutées'
    ]
  },
  'Marionnettiste': {
    name: 'Marionnettiste',
    description: 'Forcez un joueur à voter contre un autre pendant la phase du Jugement.',
    team: 'pieges',
    abilities: [
      'Manipulation des votes',
      'Communication secrète entre Piégés'
    ]
  },
  'Ombre': {
    name: 'Ombre',
    description: 'Si vous êtes éliminé, vous pouvez emmener une autre personne avec vous dans la mort.',
    team: 'pieges',
    abilities: [
      'Vengeance mortelle',
      'Communication secrète entre Piégés'
    ]
  }
};

const mockPlayers: Player[] = Array.from({ length: 15 }, (_, i) => ({
  id: (i + 1).toString(),
  username: prenoms[i],
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${prenoms[i]}`,
  isAlive: true,
  isCurrentTurn: i === 3,
  isCurrent: i === 3,
  description: `${prenoms[i]} aime jouer stratégiquement et préfère observer avant d'agir.`,
  stats: {
    gamesPlayed: Math.floor(Math.random() * 100) + 20,
    gamesWon: Math.floor(Math.random() * 50) + 10,
    totalKills: Math.floor(Math.random() * 30),
    favoriteRole: 'Assis',
    winRate: `${Math.floor(Math.random() * 30) + 40}%`
  },
  position: i
}));

interface PlayerChairProps {
  player: Player;
  onCommunicate: (type: 'audio' | 'video' | 'text', playerId: string) => void;
  angle: number;
  activeCommunications: {
    fromId: string;
    toId: string;
    type: 'audio' | 'video' | 'text';
  }[];
  radius: number;
}

const PlayerChair: React.FC<PlayerChairProps> = ({ player, onCommunicate, angle, activeCommunications, radius }) => {
  const borderColor = player.isAlive ? 'cyan.400' : 'red.500';
  
  // Calculer la position initiale avec le rayon fourni
  let initialX = Math.cos(angle) * radius;
  let initialY = Math.sin(angle) * radius;

  // Ajuster la position si une communication est active
  const activeCommunication = activeCommunications.find(
    comm => comm.fromId === player.id || comm.toId === player.id
  );

  let finalX = initialX;
  let finalY = initialY;

  if (activeCommunication) {
    const meetingPoint = {
      x: -radius * 0.3,
      y: 0
    };

    if (activeCommunication.fromId === player.id || activeCommunication.toId === player.id) {
      finalX = initialX + (meetingPoint.x - initialX) * 0.8;
      finalY = initialY + (meetingPoint.y - initialY) * 0.8;

      if (activeCommunication.toId === player.id) {
        finalX += radius * 0.15;
      }
    }
  }

  return (
    <Box
      position="absolute"
      top="50%"
      left="50%"
      style={{
        transform: `translate(calc(-50% + ${finalX}px), calc(-50% + ${finalY}px))`
      }}
      transition="all 0.5s ease-in-out"
      animation="float 3s ease-in-out infinite"
      zIndex={2}
    >
      <Popover placement="top" isLazy gutter={20}>
        <PopoverTrigger>
          <Box position="relative">
            <Avatar
              size="md"
              name={player.username}
              src={player.avatar}
              border="2px solid"
              borderColor={borderColor}
              boxShadow={`0 0 10px ${borderColor}`}
              transition="all 0.3s ease"
              _hover={{
                transform: 'scale(1.05)',
                boxShadow: `0 0 20px ${borderColor}`
              }}
            />
            {!player.isAlive && (
              <Box
                position="absolute"
                inset="0"
                borderRadius="full"
                bg="rgba(0, 0, 0, 0.7)"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={GiDeathSkull} color="red.500" boxSize="1.5rem" />
              </Box>
            )}
            {player.isCurrentTurn && (
              <Circle
                size="4"
                bg="yellow.400"
                position="absolute"
                top="-1"
                right="-1"
                borderWidth="2px"
                borderColor="yellow.600"
                boxShadow="0 0 10px yellow"
              />
            )}
            <Text
              fontSize="sm"
              fontWeight="bold"
              color={borderColor}
              textShadow={`0 0 5px ${borderColor}`}
              letterSpacing="wide"
              mt={2}
              textAlign="center"
            >
              {player.username}
      </Text>
          </Box>
        </PopoverTrigger>
        <PopoverContent 
          bg="gray.900" 
          borderColor={borderColor} 
          boxShadow={`0 0 20px ${borderColor}`}
          _focus={{ outline: 'none' }}
          w="300px"
          transform="translateY(-20px)"
          zIndex={9999}
        >
          <PopoverArrow bg="gray.900" />
          <PopoverCloseButton />
          <PopoverHeader borderColor={borderColor} p={4}>
            <HStack spacing={4}>
              <Avatar 
                size="md" 
                name={player.username} 
                src={player.avatar}
                borderWidth="2px"
                borderColor={borderColor}
              />
              <VStack align="start" spacing={1}>
                <Text fontSize="lg" fontWeight="bold">{player.username}</Text>
                <Badge 
                  colorScheme={player.isAlive ? 'cyan' : 'red'}
                  px={3}
                  py={1}
                  borderRadius="full"
                  variant="solid"
                >
                  {player.isAlive ? 'Vivant' : 'Mort'}
                </Badge>
              </VStack>
            </HStack>
          </PopoverHeader>
          <PopoverBody p={4}>
            <VStack align="start" spacing={4}>
              <Text fontSize="sm" color="gray.300" fontStyle="italic">
                {player.description}
      </Text>
              <SimpleGrid columns={2} spacing={4} w="full">
                <Stat size="sm">
                  <StatLabel color="gray.400">Parties jouées</StatLabel>
                  <StatNumber color="white">{player.stats?.gamesPlayed}</StatNumber>
                </Stat>
                <Stat size="sm">
                  <StatLabel color="gray.400">Victoires</StatLabel>
                  <StatNumber color="white">{player.stats?.gamesWon}</StatNumber>
                </Stat>
                <Stat size="sm">
                  <StatLabel color="gray.400">Éliminations</StatLabel>
                  <StatNumber color="white">{player.stats?.totalKills}</StatNumber>
                </Stat>
                <Stat size="sm">
                  <StatLabel color="gray.400">Taux de victoire</StatLabel>
                  <StatNumber color="white">{player.stats?.winRate}</StatNumber>
                </Stat>
              </SimpleGrid>
    </VStack>
          </PopoverBody>
          <PopoverFooter borderColor={borderColor} p={4}>
            <HStack spacing={3} justify="center">
              <IconButton
                aria-label="Message audio"
                icon={<FaMicrophone />}
                colorScheme="cyan"
                variant="outline"
                size="md"
                onClick={() => onCommunicate('audio', player.id)}
                _hover={{ bg: 'rgba(104, 211, 245, 0.1)' }}
              />
              <IconButton
                aria-label="Message vidéo"
                icon={<FaVideo />}
                colorScheme="cyan"
                variant="outline"
                size="md"
                onClick={() => onCommunicate('video', player.id)}
                _hover={{ bg: 'rgba(104, 211, 245, 0.1)' }}
              />
              <IconButton
                aria-label="Message écrit"
                icon={<FaComments />}
                colorScheme="cyan"
                variant="outline"
                size="md"
                onClick={() => onCommunicate('text', player.id)}
                _hover={{ bg: 'rgba(104, 211, 245, 0.1)' }}
              />
            </HStack>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
      {activeCommunication && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          height="2px"
          bg="linear-gradient(90deg, purple.400, transparent)"
          transform={`rotate(${angle}deg)`}
          transformOrigin="left center"
          width="100%"
          animation="communicationBeam 2s ease-in-out infinite"
          zIndex={0}
        />
      )}
  </Box>
);
};

// Modifier les interfaces pour une meilleure gestion des types
interface BaseMessage {
  id: string;
  from: string;
  timestamp: Date;
  isRead: boolean;
}

interface TextMessage extends BaseMessage {
  type: 'text';
  content: string;
}

interface MediaMessage extends BaseMessage {
  type: 'audio' | 'video';
  content: Blob;
}

type ReceivedMessage = TextMessage | MediaMessage;

// Utiliser les constantes de phase importées
const phaseDescriptions = {
  SETUP: 'Les joueurs reçoivent leurs rôles et peuvent commencer à discuter. N\'oubliez pas d\'envoyer au moins une vidéo !',
  DAY: 'Débattez, bluffez et tentez de démasquer les traîtres. Une vidéo obligatoire par phase !',
  JUDGMENT: 'Le joueur le plus suspect doit se défendre. Votez pour décider de son sort.',
  NIGHT: 'Les Piégés choisissent leur victime. Woolfy et les rôles spéciaux agissent.',
  VOTE: 'Phase de vote en cours...'
} as const;

const GameTimer: React.FC<{ timeRemaining: number; phase: GamePhase }> = ({ timeRemaining, phase }) => {
  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      p={4}
      bg="rgba(0, 0, 0, 0.95)"
      borderBottom="1px solid"
      borderColor="purple.500"
      boxShadow="0 0 20px rgba(159, 122, 234, 0.4)"
      zIndex={1000}
    >
      <Container maxW="container.xl">
        <HStack spacing={8} justify="space-between" align="center">
          {/* Phase et Timer */}
          <HStack spacing={6} flex={1}>
            <HStack spacing={3}>
              {phase.type === 'NIGHT' ? (
                <Icon as={GiMoonBats} color="purple.400" boxSize="24px" />
              ) : (
                <Icon as={GiSun} color="yellow.400" boxSize="24px" />
              )}
              <Text fontSize="xl" color="white" fontWeight="bold">
            {PHASE_NAMES[phase.type]}
          </Text>
            </HStack>
            <Text fontSize="2xl" color="white" fontWeight="bold">
              {`${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}`}
          </Text>
      </HStack>

          {/* Description de la phase */}
          <Text color="gray.300" flex={2} textAlign="center">
            {phaseDescriptions[phase.type]}
          </Text>

          {/* Barre de progression */}
          <Box flex={1} maxW="200px">
            <Progress
              value={(timeRemaining / 300) * 100}
              size="sm"
              colorScheme="purple"
              bg="whiteAlpha.200"
              borderRadius="full"
            />
          </Box>
        </HStack>
      </Container>
    </Box>
  );
};

// Modifier les types et les états au début du composant
interface GamePhaseState {
  type: GamePhaseType;
  startTime: Date;
  endTime: Date;
  remainingTime: number;
}

export const GameInProgress: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  // États pour la gestion de la taille et du mode plein écran
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameAreaSize, setGameAreaSize] = useState({
    width: 800,
    height: 600,
    radius: 260
  });

  // État pour la phase de jeu
  const [currentPhase, setCurrentPhase] = useState<GamePhaseState>({
    type: 'VOTE',
    startTime: new Date(Date.now()),
    endTime: new Date(Date.now() + 300000),
    remainingTime: 300
  });

  const [players] = useState<Player[]>(mockPlayers);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCommunication, setSelectedCommunication] = useState<{
    type: 'audio' | 'video' | 'text';
    playerId: string;
  } | null>(null);
  const [activeMinigame, setActiveMinigame] = useState<MiniGame | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [activeCommunications, setActiveCommunications] = useState<{
    fromId: string;
    toId: string;
    type: 'audio' | 'video' | 'text';
  }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [votes, setVotes] = useState<Record<string, string>>({
    '1': '2', // Lucas a voté pour Emma
    '3': '2', // Gabriel a voté pour Emma
    '4': '5'  // Louise a voté pour Hugo
  });
  const [showVoteResults, setShowVoteResults] = useState(false);
  const [selectedVoteTarget, setSelectedVoteTarget] = useState<string | null>(null);
  const [receivedMessages, setReceivedMessages] = useState<ReceivedMessage[]>([
    {
      id: '1',
      type: 'text',
      content: "Je pense que Lucas est suspect, il n'a pas beaucoup parlé...",
      from: "Emma",
      timestamp: new Date(Date.now() - 5 * 60000),
      isRead: false
    },
    {
      id: '2',
      type: 'audio',
      content: new Blob(['fake-audio'], { type: 'audio/wav' }),
      from: "Gabriel",
      timestamp: new Date(Date.now() - 15 * 60000),
      isRead: true
    },
    {
      id: '3',
      type: 'video',
      content: new Blob(['fake-video'], { type: 'video/webm' }),
      from: "Louise",
      timestamp: new Date(Date.now() - 2 * 60000),
      isRead: false
    },
    {
      id: '4',
      type: 'text',
      content: "Je suis d'accord avec toi, on devrait voter contre lui !",
      from: "Hugo",
      timestamp: new Date(Date.now() - 1 * 60000),
      isRead: false
    }
  ]);

  const bgColor = useColorModeValue('gray.900', 'gray.900');
  const borderColor = useColorModeValue('purple.500', 'purple.500');

  const toast = useToast();

  const quickEmojis = ['👍', '👎', '😊', '😂', '😮', '🤔', '❤️', '👀', '🎉', '🔥'];

  // États pour la gestion des médias
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [playingMessage, setPlayingMessage] = useState<{
    type: 'audio' | 'video';
    content: Blob;
    isOpen: boolean;
  } | null>(null);

  // Modifier la fonction handlePlayMessage pour ne gérer que les messages audio/vidéo
  const handlePlayMessage = (message: MediaMessage) => {
    setPlayingMessage({
      type: message.type,
      content: message.content,
      isOpen: true
    });
  };

  // Modifier la gestion des communications
  const handleCommunication = (type: 'audio' | 'video' | 'text', playerId: string) => {
    // Nettoyer les états précédents
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }

    // Réinitialiser tous les états
    setMediaStream(null);
    setMediaRecorder(null);
    setIsRecording(false);
    setRecordedChunks([]);
    setMessageContent('');
    
    // Définir la nouvelle communication
    setSelectedCommunication({ type, playerId });
    
    // Ouvrir la modal
    onOpen();

    // Ajouter la communication active
    const currentPlayer = players.find(p => p.isCurrent);
    if (currentPlayer) {
      // Nettoyer les anciennes communications du joueur actuel
      setActiveCommunications(prev => 
        prev.filter(comm => comm.fromId !== currentPlayer.id)
      );
      
      // Ajouter la nouvelle communication
      setActiveCommunications(prev => [
        ...prev,
        {
          fromId: currentPlayer.id,
          toId: playerId,
          type
        }
      ]);
    }
  };

  // Modifier la gestion de la fermeture de la modal
  const handleCloseModal = () => {
    // Nettoyer les médias
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }

    // Réinitialiser les états
    setMediaStream(null);
    setMediaRecorder(null);
    setIsRecording(false);
    setRecordedChunks([]);
    setMessageContent('');
    
    // Nettoyer les communications actives
    const currentPlayer = players.find(p => p.isCurrent);
    if (currentPlayer) {
      setActiveCommunications(prev => 
        prev.filter(comm => comm.fromId !== currentPlayer.id)
      );
    }
    
    // Fermer la modal
    onClose();
  };

  // Modifier la fonction handleSendMessage pour une meilleure gestion des types
  const handleSendMessage = async () => {
    if (!selectedCommunication) return;

    const currentPlayer = players.find(p => p.isCurrent);
    if (!currentPlayer) return;

    try {
      if (selectedCommunication.type === 'text') {
        if (messageContent.trim()) {
          const newMessage: TextMessage = {
            id: Date.now().toString(),
            type: 'text',
            content: messageContent,
            from: currentPlayer.username,
            timestamp: new Date(),
            isRead: false
          };
          setReceivedMessages(prev => [...prev, newMessage]);
          handleCloseModal();
        }
      } else {
        if (!isRecording) {
          // Démarrer l'enregistrement
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: selectedCommunication.type === 'video'
          });
          
          setMediaStream(stream);
          const recorder = new MediaRecorder(stream);
          
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              setRecordedChunks(prev => [...prev, e.data]);
            }
          };
          
          recorder.onstop = () => {
            if (recordedChunks.length > 0) {
              const blob = new Blob(recordedChunks, {
                type: selectedCommunication.type === 'audio' ? 'audio/webm' : 'video/webm'
              });
              
              const newMessage: MediaMessage = {
                id: Date.now().toString(),
                type: selectedCommunication.type === 'audio' ? 'audio' : 'video',
                content: blob,
                from: currentPlayer.username,
                timestamp: new Date(),
                isRead: false
              };
              
              setReceivedMessages(prev => [...prev, newMessage]);
            }
            handleCloseModal();
          };
          
          setMediaRecorder(recorder);
          recorder.start();
          setIsRecording(true);
        } else {
          // Arrêter l'enregistrement
          if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      handleCloseModal();
    }
  };

  const calculatePlayerAngle = (index: number) => {
    const totalPlayers = players.length;
    return (index * (2 * Math.PI) / totalPlayers);
  };

  const handleVote = (targetId: string) => {
    const currentPlayer = players.find(p => p.isCurrent);
    if (currentPlayer) {
      setVotes(prev => ({
        ...prev,
        [currentPlayer.id]: targetId
      }));
      toast({
        title: "Vote enregistré",
        description: `Vous avez voté pour ${players.find(p => p.id === targetId)?.username}`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right"
      });
      setSelectedVoteTarget(null);
    }
  };

  const navigate = useNavigate();

  // Ajouter les états pour le chat
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [chatPosition, setChatPosition] = useState({ x: 20, y: window.innerHeight - 350 });

  // Ajouter l'état pour le rôle du joueur
  const [playerRole] = useState<PlayerRole>(roles['Assis']);

  // Modifier la fonction renderPhaseActions pour utiliser les chaînes littérales
  const renderPhaseActions = (phaseType: string) => {
    switch (phaseType) {
      case 'SETUP':
    return (
          <>
            <ListItem>• Présentez-vous aux autres joueurs (vidéo obligatoire)</ListItem>
            <ListItem>• Découvrez votre rôle et vos capacités</ListItem>
            <ListItem>• Commencez à observer les autres joueurs</ListItem>
          </>
        );
      case 'DAY':
        return (
          <>
            <ListItem>• Discutez avec les autres joueurs</ListItem>
            <ListItem>• Partagez vos soupçons (vidéo obligatoire)</ListItem>
            <ListItem>• Utilisez vos capacités spéciales si disponibles</ListItem>
          </>
        );
      case 'JUDGMENT':
        return (
          <>
            <ListItem>• Défendez-vous si vous êtes accusé</ListItem>
            <ListItem>• Écoutez la défense du joueur accusé</ListItem>
            <ListItem>• Préparez-vous à voter</ListItem>
          </>
        );
      case 'NIGHT':
        return (
          <>
            <ListItem>• Les Piégés choisissent leur victime</ListItem>
            <ListItem>• Woolfy peut utiliser ses capacités</ListItem>
            <ListItem>• Les rôles spéciaux peuvent agir</ListItem>
          </>
        );
      case 'VOTE':
        return (
          <>
            <ListItem>• Choisissez un joueur à éliminer</ListItem>
            <ListItem>• Vous ne pouvez pas changer votre vote</ListItem>
            <ListItem>• Le joueur avec le plus de votes sera éliminé</ListItem>
          </>
        );
      default:
        return null;
    }
  };

  // Fonction pour gérer le changement de mode plein écran
  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      setGameAreaSize({
        width: window.innerWidth,
        height: window.innerHeight,
        radius: Math.min(window.innerWidth, window.innerHeight) / 3
      });
    } else {
      setGameAreaSize({
        width: 800,
        height: 600,
        radius: 260
      });
    }
  };

  return (
    <Box position="relative" minH="100vh" bg={bgColor}>
      {/* Timer en haut */}
      <GameTimer timeRemaining={currentPhase.remainingTime} phase={currentPhase as GamePhase} />

      {/* Contenu principal */}
      <Container maxW="container.xl" pt={20} pb={4}>
        <Grid templateColumns="1fr 320px" gap={8}>
          {/* Colonne gauche - Phase Actuelle */}
          <GridItem>
            {/* Bloc Phase Actuelle */}
            <Box
              mb={6}
              p={6}
              bg="rgba(0, 0, 0, 0.6)"
              borderRadius="xl"
              borderWidth="1px"
              borderColor={borderColor}
              boxShadow="lg"
            >
              <Grid templateColumns="1fr 1fr" gap={6}>
                {/* Colonne Phase Actuelle */}
                <Box>
                  <VStack spacing={4} align="stretch">
                    <Text fontSize="lg" color="purple.400" fontWeight="bold">
                      Phase actuelle : {PHASE_NAMES[currentPhase.type]}
                    </Text>
                    <Box>
                      <Text color="gray.300" mb={2}>
                        Actions à effectuer :
                      </Text>
                      <UnorderedList spacing={2} styleType="none">
                        {renderPhaseActions(currentPhase.type)}
                      </UnorderedList>
                    </Box>
                  </VStack>
                </Box>

                {/* Colonne Vote */}
                <Box>
                  <VStack spacing={4} align="stretch">
                    <Text fontSize="lg" color="purple.400" fontWeight="bold">
                      Vote
                    </Text>
                    {currentPhase.type === 'VOTE' ? (
                      <>
                        <Text color="yellow.400" fontWeight="bold">
                          Votes restants : {Object.keys(votes).length}/{players.filter(p => p.isAlive).length}
                        </Text>
                        <Box>
                          <Text color="gray.300" mb={2}>
                            Sélectionnez un joueur pour voter :
                          </Text>
                          <SimpleGrid columns={2} spacing={2}>
                            {players
                              .filter(p => p.isAlive)
                              .map(player => (
                                <Button
          key={player.id}
                                  size="sm"
                                  variant={selectedVoteTarget === player.id ? "solid" : "outline"}
                                  colorScheme="purple"
                                  onClick={() => handleVote(player.id)}
                                  isDisabled={Object.values(votes).includes(player.id)}
                                >
            {player.username}
                                </Button>
                              ))}
                          </SimpleGrid>
                        </Box>
                      </>
                    ) : (
                      <Text color="gray.300">
                        La phase de vote n'est pas encore commencée.
                </Text>
                    )}
                  </VStack>
                </Box>
              </Grid>
            </Box>

            {/* Zone de jeu */}
            <Box
              position={isFullscreen ? "fixed" : "relative"}
              top={isFullscreen ? "0" : "auto"}
              left={isFullscreen ? "0" : "auto"}
              right={isFullscreen ? "0" : "auto"}
              bottom={isFullscreen ? "0" : "auto"}
              width={isFullscreen ? "100vw" : "100%"}
              height={isFullscreen ? "100vh" : `${gameAreaSize.height}px`}
              bg={isFullscreen ? "gray.900" : "transparent"}
              borderRadius={isFullscreen ? "0" : "xl"}
              borderWidth="1px"
              borderColor={borderColor}
              overflow="visible"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
              zIndex={isFullscreen ? "modal" : "auto"}
            >
              {/* Contrôles de taille */}
              <HStack 
                position="absolute" 
                top={2} 
                right={2} 
                spacing={2}
                zIndex={3}
              >
                <IconButton
                  aria-label={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
                  icon={isFullscreen ? <SmallCloseIcon /> : <ViewIcon />}
                  size="sm"
                  colorScheme="purple"
                  variant="ghost"
                  onClick={handleFullscreenToggle}
                  _hover={{ bg: 'whiteAlpha.200' }}
                />
              </HStack>

              {/* Étoiles en arrière-plan */}
              {Array.from({ length: isFullscreen ? 50 : 30 }).map((_, i) => (
                <Box
                  key={i}
                  position="absolute"
                  width="2px"
                  height="2px"
                  bg="white"
                  borderRadius="full"
                  left={`${Math.random() * 100}%`}
                  top={`${Math.random() * 100}%`}
                  opacity={Math.random() * 0.7 + 0.3}
                  animation={`${1 + Math.random() * 2}s ease-in-out infinite alternate`}
                  sx={{
                    boxShadow: '0 0 2px white'
                  }}
                />
              ))}

              {/* Zone des joueurs */}
              <Box
                position="relative"
                width="100%"
                height="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {players.map((player, index) => (
                  <PlayerChair
                    key={player.id}
                    player={player}
                    angle={calculatePlayerAngle(index)}
                    onCommunicate={handleCommunication}
                    activeCommunications={activeCommunications}
                    radius={isFullscreen ? Math.min(window.innerWidth, window.innerHeight) / 3 : gameAreaSize.radius}
                  />
                ))}
              </Box>
            </Box>
          </GridItem>

          {/* Colonne droite - Profil, Rôle et Messages */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Section Mon Profil */}
              <Box
                p={6}
                bg="rgba(0, 0, 0, 0.6)"
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                boxShadow="lg"
              >
                <VStack spacing={4} align="stretch">
                  <Heading size="md" color="purple.400">
                    Mon Profil
                  </Heading>
                  <Button
                    leftIcon={<FaUser />}
                    colorScheme="purple"
                    variant="outline"
                    onClick={() => navigate('/ProfilePage')}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(159, 122, 234, 0.4)'
                    }}
                  >
                    Voir mon profil
                  </Button>
                </VStack>
              </Box>

              {/* Section Votre Rôle */}
              <Box
                p={6}
                bg="rgba(0, 0, 0, 0.6)"
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                boxShadow="lg"
              >
                <VStack spacing={4} align="stretch">
                  <Heading size="md" color="purple.400">
                    Votre Rôle
                  </Heading>
                  <Box
                    p={4}
                    bg="whiteAlpha.100"
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="purple.500"
                  >
                    <VStack align="stretch" spacing={3}>
                      <HStack>
                        <Icon as={GiWolfHowl} color="purple.400" boxSize="24px" />
                        <Text fontSize="lg" fontWeight="bold" color="purple.400">
                          {playerRole.name}
                  </Text>
                      </HStack>
                      <Text color="gray.300">
                        {playerRole.description}
                      </Text>
                      <Box>
                        <Text color="purple.400" fontWeight="bold" mb={2}>
                          Capacités :
                        </Text>
                        <UnorderedList spacing={1} styleType="none">
                          {playerRole.abilities.map((ability, index) => (
                            <ListItem key={index} color="gray.300">
                              • {ability}
                            </ListItem>
                          ))}
                        </UnorderedList>
                      </Box>
                    </VStack>
                  </Box>
                </VStack>
              </Box>

              {/* Section Messages Reçus */}
              <Box
                p={6}
                bg="rgba(0, 0, 0, 0.6)"
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                boxShadow="lg"
                maxH="500px"
                display="flex"
                flexDirection="column"
              >
                <Heading size="md" color="purple.400" mb={4}>
                  Messages Reçus {receivedMessages.filter(m => !m.isRead).length > 0 && (
                    <Badge ml={2} colorScheme="red" borderRadius="full">
                      {receivedMessages.filter(m => !m.isRead).length}
                    </Badge>
                  )}
                </Heading>
                
                <Box 
                  flex="1"
                  overflowY="auto"
                  css={{
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: '8px',
                      margin: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(128, 90, 213, 0.5)',
                      borderRadius: '8px',
                      border: '2px solid transparent',
                      backgroundClip: 'padding-box',
                    },
                  }}
                >
                  <VStack spacing={3} align="stretch">
                    {receivedMessages.map(message => (
                      <Box
                        key={message.id}
                        p={4}
                        bg="whiteAlpha.100"
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor={message.isRead ? "whiteAlpha.200" : "purple.500"}
                        _hover={{ bg: "whiteAlpha.200" }}
                      >
                        <VStack align="stretch" spacing={3}>
                          <HStack justify="space-between">
                            <HStack>
                              <Icon
                                as={
                                  message.type === 'text'
                                    ? FaComments
                                    : message.type === 'audio'
                                    ? FaMicrophone
                                    : FaVideo
                                }
                                color="purple.400"
                              />
                              <Text fontWeight="bold">{message.from}</Text>
                            </HStack>
                            {!message.isRead && (
                              <Badge colorScheme="purple">Nouveau</Badge>
                            )}
                          </HStack>
                          {message.type === 'text' ? (
                            <Text color="gray.300">{message.content as string}</Text>
                          ) : (
                            <HStack spacing={2}>
                              <Button
                                leftIcon={message.type === 'audio' ? <FaMicrophone /> : <FaVideo />}
                                onClick={() => handlePlayMessage(message as MediaMessage)}
                                colorScheme="purple"
                                size="sm"
                              >
                                {message.type === 'audio' ? 'Écouter' : 'Voir'}
                              </Button>
                              <Button
                                leftIcon={<FaComments />}
                                onClick={() => {
                                  setSelectedCommunication({
                                    type: message.type,
                                    playerId: players.find(p => p.username === message.from)?.id || ''
                                  });
                                  onOpen();
                                }}
                                colorScheme="purple"
                                size="sm"
                                variant="outline"
                              >
                                Répondre
                              </Button>
                            </HStack>
          )}
          </VStack>
                      </Box>
      ))}
                  </VStack>
                </Box>
              </Box>
            </VStack>
          </GridItem>
    </Grid>
      </Container>

      {/* Chat */}
      <Box
        position="fixed"
        left={`${chatPosition.x}px`}
        top={`${chatPosition.y}px`}
        width={isChatMinimized ? "auto" : "400px"}
        bg="transparent"
        zIndex={100}
        cursor="move"
        onMouseDown={(e) => {
          const startX = e.clientX - chatPosition.x;
          const startY = e.clientY - chatPosition.y;
          
          const handleMouseMove = (e: MouseEvent) => {
            setChatPosition({
              x: e.clientX - startX,
              y: e.clientY - startY
            });
          };
          
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      >
        <Box
          bg="rgba(0, 0, 0, 0.7)"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="purple.500"
          overflow="hidden"
          boxShadow="0 0 20px rgba(0, 0, 0, 0.3)"
          backdropFilter="blur(10px)"
        >
          <HStack 
            p={3} 
            bg="rgba(128, 90, 213, 0.1)" 
            borderBottom={isChatMinimized ? "none" : "1px solid"}
            borderColor="purple.500"
            spacing={3}
          >
            <Icon as={ChatIcon} color="purple.400" boxSize="14px" />
            <Text fontSize="sm" color="purple.400" fontWeight="medium">
              Chat du Village
            </Text>
            <Spacer />
            <IconButton
              aria-label={isChatMinimized ? "Agrandir" : "Réduire"}
              icon={isChatMinimized ? <ViewIcon /> : <SmallCloseIcon />}
              size="xs"
              variant="ghost"
              colorScheme="purple"
              onClick={() => setIsChatMinimized(!isChatMinimized)}
              _hover={{ bg: 'whiteAlpha.100' }}
            />
          </HStack>

          {!isChatMinimized && (
            <>
              <Box height="250px" overflowY="auto" p={3}>
                <VillageChat />
              </Box>

              <HStack p={2} bg="rgba(0, 0, 0, 0.3)" spacing={2}>
                <Input
                  placeholder="Message..."
                  size="sm"
                  bg="transparent"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  _hover={{ borderColor: 'purple.500' }}
                  _focus={{ borderColor: 'purple.500', boxShadow: 'none' }}
                  fontSize="sm"
                />
                <IconButton
                  aria-label="Envoyer"
                  icon={<ChatIcon />}
                  size="sm"
                  colorScheme="purple"
                  variant="ghost"
                  _hover={{ bg: 'whiteAlpha.100' }}
                />
              </HStack>
            </>
          )}
        </Box>
      </Box>

      {/* Modal de messages */}
      <Modal isOpen={isOpen} onClose={handleCloseModal}>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent
          bg="gray.900"
          borderWidth="1px"
          borderColor="purple.500"
          boxShadow="0 0 20px rgba(159, 122, 234, 0.4)"
        >
          <ModalHeader borderBottomWidth="1px" borderColor="purple.500">
            {selectedCommunication?.type === 'text' 
              ? 'Envoyer un message' 
              : selectedCommunication?.type === 'audio' 
                ? 'Enregistrer un message audio' 
                : 'Enregistrer un message vidéo'
            }
          </ModalHeader>
          <ModalCloseButton onClick={handleCloseModal} />
          <ModalBody py={6}>
            {selectedCommunication?.type === 'text' ? (
              <Input
                placeholder="Écrivez votre message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                bg="whiteAlpha.100"
                borderColor="purple.500"
                _hover={{ borderColor: 'purple.400' }}
                _focus={{ borderColor: 'purple.400', boxShadow: 'none' }}
              />
            ) : (
              <VStack spacing={4} align="center">
                <Icon 
                  as={selectedCommunication?.type === 'audio' ? FaMicrophone : FaVideo}
                  boxSize="48px"
                  color={isRecording ? "red.500" : "purple.400"}
                  animation={isRecording ? "pulse 1s infinite" : undefined}
                />
                <Text color="gray.300">
                  {isRecording ? 'Enregistrement en cours...' : 'Cliquez sur Démarrer'}
                </Text>
                {selectedCommunication?.type === 'video' && mediaStream && (
                  <video
                    ref={(video) => {
                      if (video) {
                        video.srcObject = mediaStream;
                        video.play();
                      }
                    }}
                    muted
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor="purple.500">
            <Button
              mr={3}
              size="lg"
              colorScheme={isRecording ? "red" : "purple"}
              onClick={handleSendMessage}
              isDisabled={selectedCommunication?.type === 'text' && !messageContent.trim()}
            >
              {selectedCommunication?.type === 'text' 
                ? 'Envoyer' 
                : isRecording 
                  ? 'Arrêter' 
                  : 'Démarrer'
              }
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleCloseModal}
              size="lg"
              _hover={{ bg: 'whiteAlpha.100' }}
            >
              Annuler
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de lecture */}
      <Modal 
        isOpen={!!playingMessage} 
        onClose={() => {
          if (playingMessage) {
            URL.revokeObjectURL(URL.createObjectURL(playingMessage.content));
          }
          setPlayingMessage(null);
        }}
      >
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent
          bg="gray.900"
          borderWidth="1px"
          borderColor="purple.500"
          boxShadow="0 0 20px rgba(159, 122, 234, 0.4)"
        >
          <ModalHeader borderBottomWidth="1px" borderColor="purple.500">
            {playingMessage?.type === 'audio' ? 'Lecture Audio' : 'Lecture Vidéo'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            {playingMessage && (
              <>
                {playingMessage.type === 'audio' ? (
                  <audio
                    controls
                    autoPlay
                    src={URL.createObjectURL(playingMessage.content)}
                    style={{ width: '100%' }}
                  />
                ) : (
                  <video
                    controls
                    autoPlay
                    src={URL.createObjectURL(playingMessage.content)}
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                )}
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};