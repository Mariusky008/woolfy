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
  AspectRatio,
} from '@chakra-ui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { GiMagicSwirl, GiNotebook, GiWolfHowl, GiTrophyCup, GiLaurelCrown, GiDeathSkull, GiMoonBats, GiSun, GiWoodenChair } from 'react-icons/gi'
import { TimeIcon, ChatIcon, PhoneIcon, ViewIcon, CloseIcon, SmallCloseIcon, ViewOffIcon } from '@chakra-ui/icons'
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
import { MadameWoolfyModal } from '../../components/MadameWoolfyModal'

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

interface WoolfyQuestion {
  id: string;
  text: string;
  phase: GamePhaseType;
  category: 'comportement' | 'strategie' | 'observation' | 'deduction';
}

const woolfyQuestions: WoolfyQuestion[] = [
  {
    id: '1',
    text: "Si vous deviez protéger un joueur cette nuit, lequel choisiriez-vous et pourquoi ?",
    phase: 'NIGHT',
    category: 'strategie'
  },
  {
    id: '2',
    text: "Quel joueur vous semble le plus suspect jusqu'à présent et quels sont vos arguments ?",
    phase: 'DAY',
    category: 'observation'
  },
  {
    id: '3',
    text: "Comment interprétez-vous le comportement silencieux de certains joueurs ?",
    phase: 'JUDGMENT',
    category: 'comportement'
  },
  {
    id: '4',
    text: "Quels indices vous ont permis de suspecter ou d'innocenter des joueurs ?",
    phase: 'DAY',
    category: 'deduction'
  },
  {
    id: '5',
    text: "Si vous étiez Woolfy, quelle serait votre stratégie pour ne pas vous faire repérer ?",
    phase: 'DAY',
    category: 'strategie'
  },
  {
    id: '6',
    text: "Quel joueur vous semble le plus digne de confiance et pourquoi ?",
    phase: 'JUDGMENT',
    category: 'observation'
  },
  {
    id: '7',
    text: "Comment avez-vous interprété les derniers votes de l'assemblée ?",
    phase: 'VOTE',
    category: 'deduction'
  },
  {
    id: '8',
    text: "Quelles alliances pensez-vous avoir identifiées parmi les joueurs ?",
    phase: 'DAY',
    category: 'observation'
  },
  {
    id: '9',
    text: "Comment comptez-vous utiliser les informations récoltées pendant la nuit ?",
    phase: 'NIGHT',
    category: 'strategie'
  },
  {
    id: '10',
    text: "Quel joueur a selon vous changé de comportement récemment ?",
    phase: 'JUDGMENT',
    category: 'comportement'
  }
];

interface WoolfyInterview {
  id: string;
  playerId: string;
  questionId: string;
  videoUrl: string;
  timestamp: Date;
  phase: GamePhaseType;
  recipientId: string;
  isResponse: boolean;
  parentInterviewId?: string;
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

const mockPlayers = Array.from({ length: 15 }, (_, i) => ({
  id: (i + 1).toString(),
  name: prenoms[i],
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
  position: i,
  score: Math.floor(Math.random() * 1000)
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

  // Ajouter les nouveaux états pour le vote
  const [voteAnimation, setVoteAnimation] = useState<{
    fromId: string;
    toId: string;
    active: boolean;
  } | null>(null);
  const [voteResults, setVoteResults] = useState<{
    [key: string]: number;
  }>({});
  const [showVoteSummary, setShowVoteSummary] = useState(false);

  // Fonction améliorée pour gérer les votes
  const handleVote = (targetId: string) => {
    const currentPlayer = players.find(p => p.isCurrent);
    if (currentPlayer) {
      // Animer le vote
      setVoteAnimation({
        fromId: currentPlayer.id,
        toId: targetId,
        active: true
      });

      // Mettre à jour les votes après l'animation
      setTimeout(() => {
        setVotes(prev => ({
          ...prev,
          [currentPlayer.id]: targetId
        }));

        // Mettre à jour les résultats
        setVoteResults(prev => ({
          ...prev,
          [targetId]: (prev[targetId] || 0) + 1
        }));

        setVoteAnimation(null);
        setSelectedVoteTarget(null);

        // Notification de vote
        toast({
          title: "Vote enregistré",
          description: `Vous avez voté pour ${players.find(p => p.id === targetId)?.username}`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right"
        });

        // Vérifier si tous les joueurs ont voté
        const alivePlayers = players.filter(p => p.isAlive).length;
        const totalVotes = Object.keys(votes).length + 1; // +1 pour le vote actuel
        if (totalVotes >= alivePlayers) {
          setShowVoteSummary(true);
        }
      }, 1000);
    }
  };

  // Composant pour l'animation du vote
  const VoteAnimation = () => {
    if (!voteAnimation) return null;

    const fromPlayer = players.find(p => p.id === voteAnimation.fromId);
    const toPlayer = players.find(p => p.id === voteAnimation.toId);
    
    if (!fromPlayer || !toPlayer) return null;

    const fromAngle = calculatePlayerAngle(players.indexOf(fromPlayer));
    const toAngle = calculatePlayerAngle(players.indexOf(toPlayer));
    
    const fromX = Math.cos(fromAngle) * gameAreaSize.radius;
    const fromY = Math.sin(fromAngle) * gameAreaSize.radius;
    const toX = Math.cos(toAngle) * gameAreaSize.radius;
    const toY = Math.sin(toAngle) * gameAreaSize.radius;

    // Calculer le point de contrôle pour la courbe de Bézier
    const controlX = (fromX + toX) / 2 - (toY - fromY) * 0.5;
    const controlY = (fromY + toY) / 2 + (toX - fromX) * 0.5;

    return (
      <Box
        position="absolute"
        top="50%"
        left="50%"
        width="100%"
        height="100%"
        pointerEvents="none"
      >
        {/* Ligne de vote courbe */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width="100%"
          height="100%"
        >
          <svg width="100%" height="100%" style={{ position: 'absolute', top: '0', left: '0' }}>
            <path
              d={`M ${fromX + gameAreaSize.width/2} ${fromY + gameAreaSize.height/2} 
                 Q ${controlX + gameAreaSize.width/2} ${controlY + gameAreaSize.height/2} 
                 ${toX + gameAreaSize.width/2} ${toY + gameAreaSize.height/2}`}
              fill="none"
              stroke="rgba(255, 0, 0, 0.3)"
              strokeWidth="2"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(255, 0, 0, 0.5))'
              }}
            />
          </svg>
        </Box>

        {/* Particules de vote */}
        {[...Array(5)].map((_, i) => (
          <Box
            key={i}
            position="absolute"
            width="8px"
            height="8px"
            borderRadius="full"
            bg="red.500"
            transform={`translate(-50%, -50%)`}
            animation={`vote-particle-${i} 1s ease-out forwards`}
            sx={{
              [`@keyframes vote-particle-${i}`]: {
                '0%': {
                  transform: `translate(calc(-50% + ${fromX}px), calc(-50% + ${fromY}px)) scale(0)`,
                  opacity: 0
                },
                '20%': {
                  transform: `translate(calc(-50% + ${fromX + (controlX - fromX) * 0.2}px), calc(-50% + ${fromY + (controlY - fromY) * 0.2}px)) scale(1)`,
                  opacity: 1
                },
                '100%': {
                  transform: `translate(calc(-50% + ${toX}px), calc(-50% + ${toY}px)) scale(0)`,
                  opacity: 0
                }
              }
            }}
            boxShadow="0 0 15px red"
            style={{
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </Box>
    );
  };

  // Modal de résumé des votes
  const VoteSummaryModal = () => (
      <Modal 
        isOpen={showVoteSummary} 
        onClose={() => setShowVoteSummary(false)}
        isCentered
      >
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent
          bg="rgba(26, 32, 44, 0.95)"
          borderWidth={1}
          borderColor="purple.500"
          boxShadow="0 0 30px rgba(159, 122, 234, 0.4)"
          color="white"
        >
          <ModalHeader>Résultats des Votes</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              {Object.entries(voteResults)
                .sort(([, a], [, b]) => b - a)
                .map(([playerId, count]) => {
                  const player = players.find(p => p.id === playerId);
                  if (!player) return null;
                  
                  return (
                    <Box
                      key={playerId}
                      w="100%"
                      p={4}
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="whiteAlpha.200"
                      bg="whiteAlpha.100"
                  >
                    <HStack justify="space-between">
                      <HStack>
                        <Avatar size="sm" name={player.username} src={player.avatar} />
                        <Text>{player.username}</Text>
                      </HStack>
                      <Badge colorScheme="purple" fontSize="lg" px={3} py={1}>
                        {count} vote{count > 1 ? 's' : ''}
                      </Badge>
                    </HStack>
                  </Box>
                );
              })}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );

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

  const [woolfyInterviews, setWoolfyInterviews] = useState<WoolfyInterview[]>([]);
  const [currentInterview, setCurrentInterview] = useState<{
    playerId: string;
    questionId: string;
    isRecording: boolean;
  } | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [canStopRecording, setCanStopRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const interviewVideoRef = useRef<HTMLVideoElement>(null);
  const interviewRecorderRef = useRef<MediaRecorder | null>(null);

  const startWoolfyInterview = useCallback(async () => {
    // Vérifier si une interview est déjà en cours
    if (showInterviewModal || currentInterview) {
      console.log('Une interview est déjà en cours');
      return;
    }

    // Vérifier le nombre d'interviews déjà réalisées dans cette phase
    const currentPhaseInterviews = woolfyInterviews.filter(i => i.phase === currentPhase.type);
    if (currentPhaseInterviews.length >= 6) {
      console.log('Nombre maximum d\'interviews atteint pour cette phase');
      return;
    }

    // Calculer le nombre de joueurs à interviewer
    const alivePlayers = players.filter(p => p.isAlive);
    const remainingInterviews = 6 - currentPhaseInterviews.length;
    const minPlayers = Math.min(4, alivePlayers.length); // Au moins 4 joueurs différents ou tous si moins de 4 vivants
    const maxPlayers = Math.min(remainingInterviews, alivePlayers.length); // Ne pas dépasser le nombre d'interviews restantes

    // Sélectionner les joueurs qui n'ont pas encore été interviewés dans cette phase
    const availablePlayers = alivePlayers.filter(p => 
      !woolfyInterviews.some(i => 
        i.playerId === p.id && 
        i.phase === currentPhase.type
      )
    );

    if (availablePlayers.length === 0) {
      console.log('Plus de joueurs disponibles pour les interviews');
      return;
    }

    // Mélanger les joueurs disponibles et prendre le nombre requis
    const shuffledPlayers = [...availablePlayers].sort(() => Math.random() - 0.5);
    const numPlayers = Math.max(minPlayers, Math.min(maxPlayers, shuffledPlayers.length));
    const selectedPlayers = shuffledPlayers.slice(0, numPlayers);

    // Variable pour suivre l'interview en cours
    let currentInterviewIndex = 0;

    const processNextInterview = async () => {
      if (currentInterviewIndex >= selectedPlayers.length) {
        return; // Toutes les interviews sont terminées
      }

      const player = selectedPlayers[currentInterviewIndex];
      
      // Vérifier si le joueur actuel est celui qui doit être interviewé
      const currentPlayer = players.find(p => p.isCurrent);
      if (!currentPlayer || currentPlayer.id !== player.id) {
        // Si ce n'est pas le bon joueur, passer à l'interview suivante
        currentInterviewIndex++;
        setTimeout(() => {
          processNextInterview();
        }, 5000);
        return;
      }

      // Sélectionner une question appropriée pour la phase actuelle
      const phaseQuestions = woolfyQuestions.filter(q => q.phase === currentPhase.type);
      if (phaseQuestions.length === 0) return;

      const randomQuestion = phaseQuestions[Math.floor(Math.random() * phaseQuestions.length)];

      // Préparer l'interview
      setCurrentInterview({
        playerId: player.id,
        questionId: randomQuestion.id,
        isRecording: false
      });

      try {
        // Configurer la capture vidéo
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        if (interviewVideoRef.current) {
          interviewVideoRef.current.srcObject = stream;
          await interviewVideoRef.current.play();
        }

        const recorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);

          // Sauvegarder l'interview
          const newInterview: WoolfyInterview = {
            id: Date.now().toString(),
            playerId: player.id,
            questionId: randomQuestion.id,
            videoUrl: url,
            timestamp: new Date(),
            phase: currentPhase.type,
            recipientId: '',
            isResponse: false,
            parentInterviewId: currentInterview?.id
          };

          setWoolfyInterviews(prev => [...prev, newInterview]);

          // Notifier tous les joueurs
          toast({
            title: "Nouvelle Interview !",
            description: `${player.username} vient de répondre à une question de Madame Woolfy.`,
            status: "info",
            duration: 5000,
            isClosable: true
          });

          // Nettoyer
          stream.getTracks().forEach(track => track.stop());
          setCurrentInterview(null);
          setShowInterviewModal(false);

          // Passer à l'interview suivante après un délai
          currentInterviewIndex++;
          setTimeout(() => {
            processNextInterview();
          }, 5000);
        };

        interviewRecorderRef.current = recorder;
        setShowInterviewModal(true);

      } catch (error) {
        console.error('Erreur lors de la préparation de l\'interview:', error);
        toast({
          title: "Erreur",
          description: "Impossible de démarrer l'interview. Veuillez réessayer.",
          status: "error",
          duration: 3000,
          isClosable: true
        });
        // En cas d'erreur, passer à l'interview suivante
        currentInterviewIndex++;
        setTimeout(() => {
          processNextInterview();
        }, 5000);
      }
    };

    // Démarrer la première interview
    processNextInterview();

  }, [currentPhase.type, players, woolfyInterviews, toast, showInterviewModal, currentInterview]);

  // Démarrer les interviews à des moments spécifiques
  useEffect(() => {
    // Ne déclencher les interviews que pendant les phases DAY et NIGHT
    if (currentPhase.type !== 'DAY' && currentPhase.type !== 'NIGHT') {
      return;
    }

    // Pour la phase DAY, attendre 30 secondes pour laisser les joueurs discuter d'abord
    // Pour la phase NIGHT, démarrer plus tôt car c'est une phase d'action
    const delay = currentPhase.type === 'DAY' ? 30000 : 10000;

    const timer = setTimeout(() => {
      // Notification pour prévenir que les interviews vont commencer
      toast({
        title: "Madame Woolfy arrive !",
        description: "Les interviews vont bientôt commencer. Préparez-vous à répondre à ses questions.",
        status: "info",
        duration: 5000,
        isClosable: true
      });

      // Démarrer les interviews 5 secondes après la notification
      setTimeout(() => {
        startWoolfyInterview();
      }, 5000);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentPhase.type, startWoolfyInterview, toast]);

  // Ajouter l'état pour l'animation de transition
  const [phaseTransition, setPhaseTransition] = useState<{
    from: GamePhaseType;
    to: GamePhaseType;
    active: boolean;
  } | null>(null);

  // Effet pour gérer les transitions de phase
  useEffect(() => {
    if (currentPhase.type) {
      setPhaseTransition(prev => prev ? {
        ...prev,
        to: currentPhase.type,
        active: true
      } : null);

      // Nettoyer l'animation après la transition
      setTimeout(() => {
        setPhaseTransition(null);
      }, 2000);
    }
  }, [currentPhase.type]);

  // Composant d'animation de transition de phase
  const PhaseTransition = () => {
    if (!phaseTransition?.active) return null;

    const getTransitionContent = (phase: GamePhaseType) => {
      switch (phase) {
        case 'DAY':
          return {
            icon: <Icon as={GiSun} boxSize="100px" color="yellow.400" />,
            text: "Le jour se lève...",
            color: "yellow.400",
            bgGradient: "linear(to-b, yellow.500, orange.500)"
          };
        case 'NIGHT':
          return {
            icon: <Icon as={GiMoonBats} boxSize="100px" color="purple.400" />,
            text: "La nuit tombe...",
            color: "purple.400",
            bgGradient: "linear(to-b, purple.900, blue.900)"
          };
        case 'VOTE':
          return {
            icon: <Icon as={GiWoodenChair} boxSize="100px" color="red.400" />,
            text: "L'heure du jugement est venue !",
            color: "red.400",
            bgGradient: "linear(to-b, red.900, purple.900)"
          };
        default:
          return {
            icon: null,
            text: "",
            color: "white",
            bgGradient: "none"
          };
      }
    };

    const content = getTransitionContent(phaseTransition.to);

    return (
      <Box
        position="fixed"
                        top={0}
                        left={0}
        right={0}
        bottom={0}
        bgGradient={content.bgGradient}
        zIndex={9999}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        animation="fadeInOut 2s ease-in-out forwards"
        sx={{
          '@keyframes fadeInOut': {
            '0%': { opacity: 0 },
            '50%': { opacity: 1 },
            '100%': { opacity: 0 }
          }
        }}
      >
        <Box
          animation="scaleIn 0.5s ease-out"
          sx={{
            '@keyframes scaleIn': {
              '0%': { transform: 'scale(0)' },
              '100%': { transform: 'scale(1)' }
            }
          }}
        >
          {content.icon}
        </Box>
        <Text
          fontSize="3xl"
          fontWeight="bold"
          color={content.color}
          mt={4}
          textShadow="0 0 10px black"
          animation="slideUp 0.5s ease-out"
          sx={{
            '@keyframes slideUp': {
              '0%': { transform: 'translateY(20px)', opacity: 0 },
              '100%': { transform: 'translateY(0)', opacity: 1 }
            }
          }}
        >
          {content.text}
        </Text>
      </Box>
    );
  };

  // Modal de confirmation de vote
  const VoteConfirmationModal = () => (
    <Modal 
      isOpen={!!selectedVoteTarget} 
      onClose={() => setSelectedVoteTarget(null)}
      isCentered
    >
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent
        bg="rgba(26, 32, 44, 0.95)"
        borderWidth={1}
        borderColor="purple.500"
        boxShadow="0 0 30px rgba(159, 122, 234, 0.4)"
        color="white"
      >
        <ModalHeader>Confirmer votre vote</ModalHeader>
        <ModalBody>
          {selectedVoteTarget && (
            <VStack spacing={4}>
              <Text>Êtes-vous sûr de vouloir voter contre :</Text>
              <HStack spacing={3} p={4} bg="whiteAlpha.100" borderRadius="md">
                <Avatar 
                  size="md" 
                  name={players.find(p => p.id === selectedVoteTarget)?.username}
                  src={players.find(p => p.id === selectedVoteTarget)?.avatar}
                />
                          <Box>
                  <Text fontWeight="bold">
                    {players.find(p => p.id === selectedVoteTarget)?.username}
                  </Text>
                            <Text fontSize="sm" color="gray.400">
                    Ce vote sera définitif
                            </Text>
                          </Box>
                        </HStack>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            mr={3}
            onClick={() => setSelectedVoteTarget(null)}
          >
            Annuler
          </Button>
          <Button
            colorScheme="red"
            onClick={() => {
              if (selectedVoteTarget) {
                handleVote(selectedVoteTarget);
                setSelectedVoteTarget(null);
              }
            }}
          >
            Confirmer le vote
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  const [showWoolfyModal, setShowWoolfyModal] = useState(false);
  const [currentEliminatedPlayer, setCurrentEliminatedPlayer] = useState<Player | null>(null);
  const [isWinnerInterview, setIsWinnerInterview] = useState(false);

  // Ajouter dans les effets existants ou les gestionnaires d'événements
  const handlePlayerElimination = useCallback((eliminatedPlayer: Player) => {
    setCurrentEliminatedPlayer(eliminatedPlayer);
    setIsWinnerInterview(false);
    setShowWoolfyModal(true);
  }, []);

  const handleGameEnd = useCallback((winners: Player[]) => {
    // Gérer chaque gagnant un par un
    winners.forEach((winner, index) => {
      setTimeout(() => {
        setCurrentEliminatedPlayer(winner);
        setIsWinnerInterview(true);
        setShowWoolfyModal(true);
      }, index * 1000); // Décaler l'affichage pour chaque gagnant
    });
  }, []);

  const handleVideoSubmit = async (recipientId: string, videoBlob: Blob) => {
    try {
      // Créer un FormData pour l'upload
      const formData = new FormData();
      formData.append('video', videoBlob);
      formData.append('recipientId', recipientId);
      formData.append('senderId', currentEliminatedPlayer?.id || '');
      formData.append('isWinnerMessage', isWinnerInterview.toString());

      // Envoyer la vidéo au serveur
      const response = await fetch('/api/woolfy-interviews', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de la vidéo');
      }

      toast({
        title: "Message vidéo envoyé !",
        description: "Votre message a été envoyé avec succès.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la vidéo:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de la vidéo.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Ajouter les effets pour gérer les éliminations et la fin de partie
  useEffect(() => {
    // Écouter les événements d'élimination
    const handleElimination = (event: CustomEvent<{ player: Player }>) => {
      handlePlayerElimination(event.detail.player);
    };

    // Écouter les événements de fin de partie
    const handleGameEndEvent = (event: CustomEvent<{ winners: Player[] }>) => {
      handleGameEnd(event.detail.winners);
    };

    window.addEventListener('playerEliminated', handleElimination as EventListener);
    window.addEventListener('gameEnd', handleGameEndEvent as EventListener);

    return () => {
      window.removeEventListener('playerEliminated', handleElimination as EventListener);
      window.removeEventListener('gameEnd', handleGameEndEvent as EventListener);
    };
  }, [handlePlayerElimination, handleGameEnd]);

  return (
    <Box position="relative" minH="100vh" bg={bgColor}>
      {/* Animation de transition de phase */}
      <PhaseTransition />

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
                {/* Animation des votes */}
                <VoteAnimation />

                {/* Liste des interviews récentes au centre */}
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  maxW="300px"
                  bg="rgba(26, 32, 44, 0.95)"
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor="purple.500"
                  p={4}
                  boxShadow="0 0 20px rgba(159, 122, 234, 0.3)"
                  zIndex={2}
                  backdropFilter="blur(10px)"
                >
                  <VStack spacing={3} align="stretch">
                    <Heading size="sm" color="purple.400">
                      Interviews Récentes
                    </Heading>
                    {woolfyInterviews.slice(-3).reverse().map(interview => {
                      const player = players.find(p => p.id === interview.playerId);
                      const question = woolfyQuestions.find(q => q.id === interview.questionId);
                      return (
                        <Box
                          key={interview.id}
                          p={2}
                          borderRadius="md"
                          borderWidth="1px"
                          borderColor="whiteAlpha.200"
                          _hover={{
                            borderColor: "purple.500",
                            bg: "whiteAlpha.100"
                          }}
                          cursor="pointer"
                          onClick={() => {
                            // Créer une modal pour voir la vidéo
                            const modal = document.createElement('div');
                            modal.style.position = 'fixed';
                            modal.style.top = '0';
                            modal.style.left = '0';
                            modal.style.width = '100%';
                            modal.style.height = '100%';
                            modal.style.backgroundColor = 'rgba(0,0,0,0.9)';
                            modal.style.display = 'flex';
                            modal.style.justifyContent = 'center';
                            modal.style.alignItems = 'center';
                            modal.style.zIndex = '9999';

                            const videoContainer = document.createElement('div');
                            videoContainer.style.position = 'relative';
                            videoContainer.style.width = '80%';
                            videoContainer.style.maxWidth = '800px';

                            const video = document.createElement('video');
                            video.src = interview.videoUrl;
                            video.controls = true;
                            video.style.width = '100%';
                            video.style.borderRadius = '8px';
                            video.style.boxShadow = '0 0 20px rgba(129, 230, 217, 0.4)';

                            const closeButton = document.createElement('button');
                            closeButton.innerHTML = '×';
                            closeButton.style.position = 'absolute';
                            closeButton.style.top = '-40px';
                            closeButton.style.right = '-40px';
                            closeButton.style.background = 'none';
                            closeButton.style.border = 'none';
                            closeButton.style.color = 'white';
                            closeButton.style.fontSize = '40px';
                            closeButton.style.cursor = 'pointer';
                            closeButton.style.padding = '10px';
                            closeButton.style.lineHeight = '1';

                            closeButton.addEventListener('click', () => {
                              document.body.removeChild(modal);
                            });

                            videoContainer.appendChild(video);
                            videoContainer.appendChild(closeButton);
                            modal.appendChild(videoContainer);

                            modal.addEventListener('click', (e) => {
                              if (e.target === modal) {
                                document.body.removeChild(modal);
                              }
                            });

                            document.body.appendChild(modal);
                          }}
                        >
                          <HStack spacing={3}>
                            <Avatar size="sm" name={player?.username} src={player?.avatar} />
                            <Box flex={1}>
                              <Text fontSize="sm" fontWeight="bold" color="white">
                                {player?.username}
                              </Text>
                              <Text fontSize="xs" color="gray.400" noOfLines={2}>
                                {question?.text}
                              </Text>
                            </Box>
                      </HStack>
                    </Box>
                  );
                })}
            </VStack>
                </Box>

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

      {/* Modal d'interview de Madame Woolfy */}
      <Modal 
        isOpen={showInterviewModal} 
        onClose={() => {
          // Empêcher la fermeture si l'interview n'est pas terminée
          if (!currentInterview?.isRecording) {
            toast({
              title: "Action non autorisée",
              description: "Vous devez répondre à la question de Madame Woolfy avant de pouvoir fermer cette fenêtre.",
              status: "warning",
              duration: 3000,
              isClosable: true
            });
            return;
          }
          if (interviewRecorderRef.current) {
            interviewRecorderRef.current.stop();
          }
          setShowInterviewModal(false);
        }}
        closeOnOverlayClick={false}
        closeOnEsc={false}
        size="xl"
        isCentered
      >
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent
          bg="rgba(26, 32, 44, 0.95)"
          borderWidth={1}
          borderColor="purple.500"
          boxShadow="0 0 30px rgba(159, 122, 234, 0.4)"
          color="white"
        >
          <ModalHeader 
            bg="purple.600" 
            color="white"
            py={4}
            textAlign="center"
            fontSize="2xl"
            fontWeight="bold"
            borderBottomWidth="4px"
            borderBottomColor="purple.700"
          >
            Interview de Madame Woolfy
            {!currentInterview?.isRecording && (
              <Text fontSize="sm" color="red.200" mt={2}>
                Vous devez répondre à cette question pour continuer
              </Text>
            )}
          </ModalHeader>
          <ModalBody p={0}>
            <VStack spacing={0}>
              <Box 
                w="full"
                bg="rgba(26, 32, 44, 0.95)"
                p={6}
              >
                {currentInterview && (
            <VStack spacing={4}>
                    <HStack spacing={4} align="center">
                      <Avatar 
                        size="lg"
                        name="Madame Woolfy"
                        src="/madame-woolfy.jpg"
                        bg="purple.500"
                      />
                      <Box>
                        <Heading size="md" color="purple.400">
                          Question pour {players.find(p => p.id === currentInterview.playerId)?.username}
                        </Heading>
                        <Text color="gray.300" mt={2}>
                          {woolfyQuestions.find(q => q.id === currentInterview.questionId)?.text}
              </Text>
                      </Box>
                    </HStack>

                    <Box
                      w="full"
                      maxW="600px"
                      borderRadius="xl"
                      borderWidth="2px"
                      borderColor="cyan.500"
                      overflow="hidden"
                      position="relative"
                    >
                      <AspectRatio ratio={16/9}>
                        <video
                          ref={interviewVideoRef}
                          autoPlay
                          playsInline
                          muted
                          style={{ 
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: 'scaleX(-1)', // Pour effet miroir
                            backgroundColor: 'rgba(26, 32, 44, 0.8)' // Fond sombre en attendant la vidéo
                          }}
                        />
                      </AspectRatio>
                      {currentInterview.isRecording && (
                      <Box
                        position="absolute"
                          top={2}
                          right={2}
                        bg="red.500"
                          borderRadius="full"
                          w={3}
                          h={3}
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

                    <Button
                      colorScheme={currentInterview.isRecording ? "red" : "green"}
                      size="lg"
                      leftIcon={currentInterview.isRecording ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => {
                        if (!currentInterview.isRecording) {
                          // Démarrer l'enregistrement
                          if (interviewRecorderRef.current) {
                            interviewRecorderRef.current.start();
                            setCurrentInterview(prev => prev ? {
                              ...prev,
                              isRecording: true
                            } : null);
                            setRecordingStartTime(Date.now());
                            setCanStopRecording(false);
                            
                            // Ajouter un message de confirmation
                            toast({
                              title: "Enregistrement démarré",
                              description: "Répondez à la question de Madame Woolfy. L'enregistrement doit durer au moins 10 secondes.",
                              status: "info",
                              duration: 5000,
                              isClosable: true
                            });
                            
                            // Activer le bouton d'arrêt après 10 secondes
                            setTimeout(() => {
                              setCanStopRecording(true);
                            }, 10000);
                          }
                        } else {
                          // Vérifier si l'enregistrement a duré au moins 10 secondes
                          if (canStopRecording && interviewRecorderRef.current) {
                            interviewRecorderRef.current.stop();
                            setRecordingStartTime(null);
                            setCanStopRecording(false);
                          } else {
                            toast({
                              title: "Enregistrement trop court",
                              description: "L'enregistrement doit durer au moins 10 secondes.",
                              status: "warning",
                              duration: 3000,
                              isClosable: true
                            });
                          }
                        }
                      }}
                      isDisabled={currentInterview.isRecording && !canStopRecording}
                    >
                      {currentInterview.isRecording ? "Terminer l'enregistrement" : "Commencer l'enregistrement"}
                    </Button>
                    {currentInterview.isRecording && (
                      <Text fontSize="sm" color="gray.300" textAlign="center">
                        {!canStopRecording ? 
                          "Attendez encore quelques secondes avant de pouvoir terminer l'enregistrement..." : 
                          "Vous pouvez maintenant terminer l'enregistrement"}
                            </Text>
                    )}
                  </VStack>
                )}
                          </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal de résumé des votes */}
      <VoteSummaryModal />
      <VoteConfirmationModal />

      <Box>
        <Button
          position="fixed"
          top="20px"
          right="20px"
          colorScheme="purple"
          onClick={startWoolfyInterview}
          zIndex={1000}
        >
          Déclencher Interview Woolfy
        </Button>
      </Box>

      {/* Bouton de test pour simuler une élimination */}
      <Button
        position="fixed"
        bottom="20px"
        right="20px"
        colorScheme="red"
        onClick={() => {
          const eliminatedPlayer = mockPlayers[0]; // On prend le premier joueur pour le test
          handlePlayerElimination(eliminatedPlayer);
        }}
        zIndex={1000}
      >
        Simuler Élimination
      </Button>

      {currentEliminatedPlayer && (
        <MadameWoolfyModal
          isOpen={showWoolfyModal}
          onClose={() => setShowWoolfyModal(false)}
          player={currentEliminatedPlayer}
          players={mockPlayers}
          isWinner={isWinnerInterview}
          onVideoSubmit={handleVideoSubmit}
        />
      )}
    </Box>
    );
  };