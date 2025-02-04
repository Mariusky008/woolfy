import {
  Box,
  Container,
  VStack,
  Text,
  Button,
  useToast,
  Heading,
  HStack,
  AspectRatio,
  SimpleGrid,
  Card,
  CardBody,
  Image,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  List,
  ListItem,
  Avatar,
  Input,
  Flex,
  IconButton,
  Collapse,
} from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckIcon, CloseIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons'

interface Player {
  id: string
  username: string
  avatar: string
  status: 'waiting' | 'confirming' | 'choosing' | 'watching' | 'completed'
  isCurrent: boolean
  videoUrl?: string
}

interface Role {
  id: string
  name: string
  image: string
  description: string
  realRole: {
    name: string
    image: string
    description: string
  }
}

// Données de test
const mockPlayers: Player[] = [
  { 
    id: '1', 
    username: 'Alice', 
    avatar: 'https://bit.ly/dan-abramov',
    status: 'completed',
    isCurrent: false,
    videoUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDd6Y2JxdWF4OWF4OWF4cWF4cWF4cWF4cWF4cWF4cWF4/l0HlvtIPzPzsNYbDi/giphy.gif'
  },
  { 
    id: '2', 
    username: 'Charlie', 
    avatar: 'https://bit.ly/prosper-baba',
    status: 'completed',
    isCurrent: false,
    videoUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDd6Y2JxdWF4OWF4OWF4cWF4cWF4cWF4cWF4cWF4cWF4/3o7TKTDn976rzVgky4/giphy.gif'
  },
  { 
    id: '3', 
    username: 'David', 
    avatar: 'https://bit.ly/code-beast',
    status: 'completed',
    isCurrent: false 
  },
  { 
    id: '4', 
    username: 'Bob', 
    avatar: 'https://bit.ly/ryan-florence',
    status: 'choosing',
    isCurrent: true 
  },
  { 
    id: '5', 
    username: 'Emma', 
    avatar: 'https://bit.ly/sage-adebayo',
    status: 'completed',
    isCurrent: false 
  },
  { 
    id: '6', 
    username: 'François', 
    avatar: 'https://bit.ly/kent-c-dodds',
    status: 'waiting',
    isCurrent: false 
  },
  { 
    id: '7', 
    username: 'Gabrielle', 
    avatar: 'https://bit.ly/tioluwani-kolawole',
    status: 'waiting',
    isCurrent: false 
  },
  { 
    id: '8', 
    username: 'Hugo', 
    avatar: 'https://bit.ly/sage-adebayo',
    status: 'waiting',
    isCurrent: false 
  },
  { 
    id: '9', 
    username: 'Isabelle', 
    avatar: 'https://bit.ly/prosper-baba',
    status: 'waiting',
    isCurrent: false 
  },
  { 
    id: '10', 
    username: 'Jean', 
    avatar: 'https://bit.ly/ryan-florence',
    status: 'waiting',
    isCurrent: false 
  },
  { 
    id: '11', 
    username: 'Kevin', 
    avatar: 'https://bit.ly/kent-c-dodds',
    status: 'waiting',
    isCurrent: false 
  },
  { 
    id: '12', 
    username: 'Laura', 
    avatar: 'https://bit.ly/sage-adebayo',
    status: 'waiting',
    isCurrent: false 
  },
  { 
    id: '13', 
    username: 'Marc', 
    avatar: 'https://bit.ly/dan-abramov',
    status: 'waiting',
    isCurrent: false 
  },
  { 
    id: '14', 
    username: 'Nina', 
    avatar: 'https://bit.ly/tioluwani-kolawole',
    status: 'waiting',
    isCurrent: false 
  },
  { 
    id: '15', 
    username: 'Olivier', 
    avatar: 'https://bit.ly/code-beast',
    status: 'waiting',
    isCurrent: false 
  },
  { 
    id: '16', 
    username: 'Patricia', 
    avatar: 'https://bit.ly/sage-adebayo',
    status: 'waiting',
    isCurrent: false 
  },
  { 
    id: '17', 
    username: 'Quentin', 
    avatar: 'https://bit.ly/dan-abramov',
    status: 'waiting',
    isCurrent: false 
  }
]

// Rôles du jeu avec les bonnes images
const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Carte Mystère 1',
    image: 'https://placehold.co/400x600/purple/white?text=?',
    description: '',
    realRole: {
      name: 'Woolfy',
      image: 'https://images.unsplash.com/photo-1615812214207-34e3be6812df?w=800&auto=format&fit=crop',
      description: 'Vous êtes le Woolfy solitaire. Chaque nuit, vous pouvez traquer et découvrir si un joueur est Piégé ou Assis. Attention à ne pas vous faire repérer !'
    }
  },
  {
    id: '2',
    name: 'Carte Mystère 2',
    image: 'https://placehold.co/400x600/purple/white?text=?',
    description: '',
    realRole: {
      name: 'Piégé',
      image: 'https://images.unsplash.com/photo-1594392175511-30eca83d51c8?w=800&auto=format&fit=crop',
      description: 'Vous êtes un Piégé. Chaque nuit, avec les autres Piégés, éliminez un Assis. Communiquez secrètement pour ne pas vous faire démasquer.'
    }
  },
  {
    id: '3',
    name: 'Carte Mystère 3',
    image: 'https://placehold.co/400x600/purple/white?text=?',
    description: '',
    realRole: {
      name: 'Protecteur',
      image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=800&auto=format&fit=crop',
      description: 'Vous êtes le Protecteur des Assis. Chaque nuit, protégez un joueur de l\'attaque des Piégés. Vous ne pouvez pas protéger la même personne deux nuits de suite.'
    }
  },
  {
    id: '4',
    name: 'Carte Mystère 4',
    image: 'https://placehold.co/400x600/purple/white?text=?',
    description: '',
    realRole: {
      name: 'Espion',
      image: 'https://images.unsplash.com/photo-1516681000991-4f0f3caa4e12?w=800&auto=format&fit=crop',
      description: 'Vous êtes l\'Espion des Assis. Une fois par nuit, vous pouvez écouter une conversation privée entre Piégés sans connaître leur identité.'
    }
  },
  {
    id: '5',
    name: 'Carte Mystère 5',
    image: 'https://placehold.co/400x600/purple/white?text=?',
    description: '',
    realRole: {
      name: 'Marionnettiste',
      image: 'https://images.unsplash.com/photo-1612011213721-3721d99ba012?w=800&auto=format&fit=crop',
      description: 'Vous êtes le Marionnettiste Piégé. Pendant la phase de Jugement, vous pouvez forcer un joueur à voter contre un autre.'
    }
  },
  {
    id: '6',
    name: 'Carte Mystère 6',
    image: 'https://placehold.co/400x600/purple/white?text=?',
    description: '',
    realRole: {
      name: 'Ombre',
      image: 'https://images.unsplash.com/photo-1596695346787-acc152b2c221?w=800&auto=format&fit=crop',
      description: 'Vous êtes l\'Ombre Piégée. Si vous êtes éliminé, vous pouvez emmener une autre personne avec vous dans la mort.'
    }
  },
  {
    id: '7',
    name: 'Carte Mystère 7',
    image: 'https://placehold.co/400x600/purple/white?text=?',
    description: '',
    realRole: {
      name: 'Assis',
      image: 'https://images.unsplash.com/photo-1594392175511-30eca83d51c8?w=800&auto=format&fit=crop',
      description: 'Vous êtes un Assis. Votre but est de survivre et de démasquer les traîtres qui ont piégé les chaises. Utilisez votre sens de l\'observation et votez avec sagesse.'
    }
  }
];

// Ajouter le style pour l'effet de retournement
const cardBackImage = 'https://images.unsplash.com/photo-1625891825446-5a39026834f9?w=800&auto=format&fit=crop'

export const GamePage = () => {
  const { id: gameId } = useParams()
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isPresent, setIsPresent] = useState(false)
  const [hasConfirmedRole, setHasConfirmedRole] = useState(false)
  const [showCards, setShowCards] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const modalVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string>('');
  const [playerVideos, setPlayerVideos] = useState<{[key: string]: string}>({
    '1': 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDd6Y2JxdWF4OWF4OWF4cWF4cWF4cWF4cWF4cWF4cWF4/l0HlvtIPzPzsNYbDi/giphy.gif',
    '2': 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDd6Y2JxdWF4OWF4OWF4cWF4cWF4cWF4cWF4cWF4cWF4/3o7TKTDn976rzVgky4/giphy.gif',
    '3': 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDd6Y2JxdWF4OWF4OWF4cWF4cWF4cWF4cWF4cWF4cWF4/l0HlKrB02QY0f1mbm/giphy.gif'
  });
  const navigate = useNavigate()
  const [timeLeft, setTimeLeft] = useState<number>(300); // 300 secondes = 5 minutes

  useEffect(() => {
    // Simuler la récupération du joueur actuel
    const current = mockPlayers.find(p => p.isCurrent)
    if (current) {
      setCurrentPlayer(current)
    }

    // Nettoyer la caméra au démontage du composant
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      // Vérifier si tous les joueurs ont terminé
      const allPlayersCompleted = mockPlayers.every(p => 
        p.status === 'completed' || (p.status === 'waiting' && timeLeft <= 0)
      );

      if (allPlayersCompleted) {
        // Si le joueur actuel a enregistré sa vidéo, rediriger vers la partie
        if (recordedVideoUrl) {
          navigate(`/games/in-progress/${gameId}`);
        } else {
          // Sinon, éliminer le joueur
          toast({
            title: 'Élimination !',
            description: 'Vous avez été éliminé car vous n\'avez pas fait votre déclaration.',
            status: 'error',
            duration: 5000,
          });
          navigate('/games');
        }
      }

      return () => clearInterval(timer);
    } else {
      // Quand le temps est écoulé
      if (recordedVideoUrl) {
        toast({
          title: 'Le temps est écoulé !',
          description: 'Tous les joueurs qui n\'ont pas fait leur déclaration sont éliminés.',
          status: 'warning',
          duration: 5000,
        });
        navigate(`/games/in-progress/${gameId}`);
      } else {
        toast({
          title: 'Temps écoulé !',
          description: 'Vous avez été éliminé car vous n\'avez pas fait votre déclaration à temps.',
          status: 'error',
          duration: 5000,
        });
        navigate('/games');
      }
    }
  }, [timeLeft, recordedVideoUrl, navigate, gameId]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const confirmPresence = async () => {
    console.log('Début de confirmPresence');
    try {
      // 1. Vérifier le support de la caméra
      if (!navigator.mediaDevices?.getUserMedia) {
        console.error('getUserMedia n\'est pas supporté');
        throw new Error('getUserMedia n\'est pas supporté');
      }

      // 2. Vérifier les périphériques disponibles
      console.log('Vérification des périphériques...');
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log('Caméras disponibles:', videoDevices.length);

      if (videoDevices.length === 0) {
        console.error('Aucune caméra trouvée');
        throw new Error('Aucune caméra trouvée');
      }

      // 3. Activer l'affichage d'abord
      setIsPresent(true);
      setShowCards(true);

      // 4. Attendre que le composant soit rendu
      await new Promise(resolve => setTimeout(resolve, 100));

      // 5. Vérifier l'élément vidéo
      const video = videoRef.current;
      if (!video) {
        console.error('Élément vidéo non trouvé');
        throw new Error('Élément vidéo non trouvé');
      }

      // 6. Tenter d'accéder à la caméra
      console.log('Tentative d\'accès à la caméra...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      console.log('Accès à la caméra réussi');

      // 7. Configurer la vidéo
      setStream(mediaStream);
      video.srcObject = mediaStream;
      await video.play();
      
      console.log('Vidéo démarrée avec succès');

      // 8. Démarrer l'enregistrement
      const mediaRecorder = new MediaRecorder(mediaStream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        if (currentPlayer) {
          setPlayerVideos(prev => ({
            ...prev,
            [currentPlayer.id]: url
          }));
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      
      // 9. Scroll vers les cartes
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 500);

      toast({
        title: 'Caméra activée !',
        description: 'Choisissez maintenant une carte pour découvrir votre rôle',
        status: 'success',
        duration: 3000,
      });

    } catch (error: any) {
      console.error('Erreur dans confirmPresence:', error);
      
      // Nettoyer en cas d'erreur
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setIsPresent(false);
      setShowCards(false);
      
      let errorMessage = 'Une erreur est survenue lors de l\'accès à la caméra.';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'L\'accès à la caméra a été refusé. Veuillez l\'autoriser dans les paramètres de votre navigateur.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Aucune caméra n\'a été trouvée sur votre appareil.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'La caméra est peut-être utilisée par une autre application.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'La configuration demandée n\'est pas supportée par votre caméra.';
      } else if (error.message) {
        errorMessage = `Erreur: ${error.message}`;
      }

      toast({
        title: 'Erreur de caméra',
        description: `${errorMessage} (${error.name || 'Error'})`,
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    }
  };

  const handleRoleSelection = (role: Role) => {
    setFlippedCardId(role.id)
    setTimeout(async () => {
      setSelectedRole(role)
      onOpen()

      // Configurer la vidéo dans la modal
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        
        if (modalVideoRef.current) {
          modalVideoRef.current.srcObject = newStream;
          await modalVideoRef.current.play();
          
          // Configurer le nouveau MediaRecorder
          const mediaRecorder = new MediaRecorder(newStream);
          const chunks: BlobPart[] = [];

          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
          };

          mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setRecordedVideoUrl(url);
            if (currentPlayer) {
              setPlayerVideos(prev => ({
                ...prev,
                [currentPlayer.id]: url
              }));
            }
            // Arrêter le flux de la modal
            newStream.getTracks().forEach(track => track.stop());
          };

          mediaRecorderRef.current = mediaRecorder;
        }
      } catch (error) {
        console.error('Erreur lors de la configuration de la vidéo dans la modal:', error);
      }
    }, 1000)
  }

  const confirmRole = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    // Ne pas arrêter le flux vidéo ici car nous en avons encore besoin
    setHasConfirmedRole(true);
    onClose();
  };

  // Nettoyer le flux vidéo seulement quand le composant est démonté
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const getPlayerStatusText = (status: Player['status']) => {
    switch (status) {
      case 'waiting':
        return 'En attente'
      case 'confirming':
        return 'Confirmation de présence...'
      case 'choosing':
        return 'Découverte du rôle...'
      case 'watching':
        return 'Regarde une réaction'
      case 'completed':
        return 'Rôle découvert'
      default:
        return status
    }
  }

  const shouldShowStartButton = () => {
    const allPlayersCompleted = mockPlayers.every(p => 
      p.status === 'completed' || (p.status === 'waiting' && timeLeft <= 0)
    );
    return hasConfirmedRole && allPlayersCompleted;
  };

  if (!currentPlayer) {
    return <Box>Chargement...</Box>
  }

  return (
    <Box 
      minH="100vh" 
      bg="gray.900"
      backgroundImage="linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url('/cyber-bg.jpg')"
      backgroundSize="cover"
      backgroundAttachment="fixed"
      color="white"
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(45deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)',
        pointerEvents: 'none'
      }}
    >
      <Container maxW="container.xl" h="100vh" p={0} position="relative">
        <VStack 
          spacing={8} 
          align="stretch" 
          h="full" 
          overflowY="auto" 
          p={8}
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              width: '6px',
              background: 'rgba(0,0,0,0.3)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'linear-gradient(180deg, #81E6D9 0%, #9F7AEA 100%)',
              borderRadius: '24px',
            },
          }}
        >
          <HStack justify="space-between" align="center">
            <Heading 
              size="xl" 
              bgGradient="linear(to-r, cyan.400, purple.500)"
              bgClip="text"
              filter="drop-shadow(0 0 8px #81E6D9)"
            >
              Distribution des Rôles
            </Heading>
            <HStack spacing={4} align="center">
              <Text
                color={timeLeft <= 60 ? "red.400" : "gray.400"}
                fontSize="sm"
                fontStyle="italic"
              >
                Élimination automatique si vous n'avez pas tiré votre rôle
              </Text>
              <Box
                bg="rgba(26, 32, 44, 0.8)"
                p={4}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={timeLeft <= 60 ? "red.500" : "purple.500"}
                boxShadow={timeLeft <= 60 ? "0 0 20px rgba(229, 62, 62, 0.3)" : "0 0 20px rgba(159, 122, 234, 0.3)"}
              >
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color={timeLeft <= 60 ? "red.400" : "cyan.400"}
                >
                  {formatTime(timeLeft)}
                </Text>
              </Box>
            </HStack>
          </HStack>

          {!isPresent ? (
            <Box
              bg="rgba(26, 32, 44, 0.8)"
              p={6}
              borderRadius="xl"
              borderWidth="1px"
              borderColor="purple.500"
              boxShadow="0 0 20px rgba(159, 122, 234, 0.3)"
              backdropFilter="blur(10px)"
              transition="all 0.3s"
              _hover={{
                boxShadow: '0 0 30px rgba(159, 122, 234, 0.5)'
              }}
            >
              <VStack spacing={6}>
                <Heading 
                  size="lg"
                  bgGradient="linear(to-r, cyan.400, purple.500)"
                  bgClip="text"
                >
                  Confirmation de Présence
                </Heading>
                <Text fontSize="lg" color="gray.300" textAlign="center">
                  C'est à votre tour de découvrir votre rôle. 
                  Confirmez votre présence pour commencer.
                </Text>
                <Button
                  size="lg"
                  bg="cyan.500"
                  color="white"
                  leftIcon={<CheckIcon />}
                  onClick={confirmPresence}
                  _hover={{
                    bg: 'cyan.600',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 0 20px rgba(129, 230, 217, 0.4)'
                  }}
                >
                  Je suis là
                </Button>
              </VStack>
            </Box>
          ) : !hasConfirmedRole ? (
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} w="full">
              {/* Colonne de gauche : Caméra */}
              <Box
                bg="rgba(26, 32, 44, 0.8)"
                p={6}
                borderRadius="xl"
                borderWidth="1px"
                borderColor="cyan.500"
                boxShadow="0 0 20px rgba(129, 230, 217, 0.3)"
                backdropFilter="blur(10px)"
              >
                <VStack spacing={4}>
                  <Heading 
                    size="md"
                    bgGradient="linear(to-r, cyan.400, purple.500)"
                    bgClip="text"
                  >
                    Votre Caméra
                  </Heading>
                  <AspectRatio ratio={16/9} maxH="400px" w="full">
                    <Box
                      position="relative"
                      overflow="hidden"
                      borderRadius="lg"
                      borderWidth="2px"
                      borderColor="cyan.500"
                      boxShadow="0 0 20px rgba(129, 230, 217, 0.2)"
                    >
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ 
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <Box
                        position="absolute"
                        top="0"
                        left="0"
                        right="0"
                        bottom="0"
                        borderRadius="lg"
                        background="linear-gradient(45deg, rgba(129, 230, 217, 0.1) 0%, rgba(159, 122, 234, 0.1) 100%)"
                        pointerEvents="none"
                      />
                    </Box>
                  </AspectRatio>
                </VStack>
              </Box>

              {/* Colonne de droite : Cartes de rôles */}
              <Box
                bg="rgba(26, 32, 44, 0.8)"
                p={6}
                borderRadius="xl"
                borderWidth="1px"
                borderColor="cyan.500"
                boxShadow="0 0 20px rgba(129, 230, 217, 0.3)"
                backdropFilter="blur(10px)"
              >
                <VStack spacing={4} align="stretch">
                  <Heading 
                    size="md"
                    bgGradient="linear(to-r, cyan.400, purple.500)"
                    bgClip="text"
                  >
                    Choisissez votre rôle
                  </Heading>
                  <SimpleGrid columns={{ base: 2, sm: 2, md: 3 }} spacing={4} w="full">
                    {mockRoles.map((role) => (
                      <Box
                        key={role.id}
                        position="relative"
                        cursor="pointer"
                        onClick={() => !flippedCardId && handleRoleSelection(role)}
                        style={{ perspective: '1000px' }}
                        w="100%"
                        transition="all 0.3s"
                        _hover={{
                          transform: 'translateY(-4px) scale(1.05)',
                          boxShadow: '0 0 20px rgba(129, 230, 217, 0.4)'
                        }}
                      >
                        <Box
                          position="relative"
                          w="100%"
                          paddingBottom="140%"
                        >
                          <Box
                            position="absolute"
                            top="0"
                            left="0"
                            right="0"
                            bottom="0"
                            transition="transform 0.8s"
                            style={{ transformStyle: 'preserve-3d' }}
                            transform={flippedCardId === role.id ? 'rotateY(180deg)' : 'rotateY(0)'}
                          >
                            {/* Face avant (dos de la carte) */}
                            <Box
                              position="absolute"
                              w="100%"
                              h="100%"
                              style={{ backfaceVisibility: 'hidden' }}
                              borderRadius="xl"
                              borderWidth="3px"
                              borderColor="purple.600"
                              overflow="hidden"
                              bg="purple.700"
                              boxShadow="xl"
                            >
                              <Box
                                w="100%"
                                h="100%"
                                bgGradient="radial(purple.600, purple.800)"
                                position="relative"
                                _before={{
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                  backgroundSize: '60px 60px',
                                  opacity: 0.2,
                                }}
                              >
                                <Box
                                  position="absolute"
                                  top="50%"
                                  left="50%"
                                  transform="translate(-50%, -50%)"
                                  borderRadius="full"
                                  bg="white"
                                  w="40px"
                                  h="40px"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  fontSize="xl"
                                  fontWeight="bold"
                                  color="purple.700"
                                  boxShadow="0 0 0 4px rgba(128, 90, 213, 0.4)"
                                >
                                  {role.id}
                                </Box>
                              </Box>
                            </Box>

                            {/* Face arrière (rôle) */}
                            <Box
                              position="absolute"
                              w="100%"
                              h="100%"
                              style={{ 
                                backfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)'
                              }}
                              borderRadius="xl"
                              borderWidth="3px"
                              borderColor="purple.600"
                              overflow="hidden"
                              bg="white"
                              boxShadow="xl"
                            >
                              <Image
                                src={role.realRole.image}
                                alt={role.realRole.name}
                                w="100%"
                                h="100%"
                                objectFit="cover"
                              />
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </SimpleGrid>
                </VStack>
              </Box>
            </SimpleGrid>
          ) : (
            <VStack spacing={6}>
              <Box
                bg="rgba(26, 32, 44, 0.8)"
                p={6}
                borderRadius="xl"
                borderWidth="1px"
                borderColor="purple.500"
                boxShadow="0 0 20px rgba(159, 122, 234, 0.3)"
                backdropFilter="blur(10px)"
                w="full"
              >
                <Heading 
                  size="md" 
                  mb={4}
                  bgGradient="linear(to-r, cyan.400, purple.500)"
                  bgClip="text"
                >
                  Votre rôle
                </Heading>
                <Box
                  borderRadius="xl"
                  borderWidth="3px"
                  borderColor="purple.500"
                  overflow="hidden"
                  w="200px"
                  h="200px"
                  boxShadow="xl"
                  position="relative"
                >
                  {selectedRole && (
                    <Image
                      src={selectedRole.realRole.image}
                      alt={selectedRole.realRole.name}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                    />
                  )}
                </Box>
                <VStack spacing={2}>
                  <Heading size="lg" color="purple.700" textAlign="center">
                    {selectedRole?.realRole.name}
                  </Heading>
                  <Text textAlign="center" color="gray.600" fontSize="md" maxW="400px">
                    {selectedRole?.realRole.description}
                  </Text>
                </VStack>
              </Box>

              {shouldShowStartButton() && (
                <Button
                  size="lg"
                  bg="cyan.500"
                  color="white"
                  _hover={{
                    bg: 'cyan.600',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 0 20px rgba(129, 230, 217, 0.4)'
                  }}
                  onClick={() => navigate(`/games/in-progress/${gameId}`)}
                >
                  Commencer la partie
                </Button>
              )}
            </VStack>
          )}

          <Box
            bg="rgba(26, 32, 44, 0.8)"
            p={6}
            borderRadius="xl"
            borderWidth="1px"
            borderColor="purple.500"
            boxShadow="0 0 20px rgba(159, 122, 234, 0.3)"
            backdropFilter="blur(10px)"
          >
            <Heading 
              size="md" 
              mb={6}
              bgGradient="linear(to-r, cyan.400, purple.500)"
              bgClip="text"
            >
              Joueurs
            </Heading>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
              {mockPlayers.map((player) => (
                <Box
                  key={player.id}
                  borderWidth={1}
                  borderRadius="lg"
                  overflow="hidden"
                  bg="rgba(26, 32, 44, 0.8)"
                  borderColor={player.isCurrent ? 'cyan.500' : 'purple.500'}
                  transition="all 0.3s"
                  _hover={player.status === 'completed' ? {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 0 20px rgba(129, 230, 217, 0.4)'
                  } : undefined}
                >
                  <AspectRatio ratio={16/9} maxH="200px">
                    {player.status === 'completed' && player.videoUrl ? (
                      <Box position="relative">
                        <video
                          src={player.videoUrl}
                          loop
                          muted
                          playsInline
                          style={{ 
                            objectFit: 'cover',
                            width: '100%',
                            height: '100%',
                            filter: 'brightness(0.7)'
                          }}
                        />
                        <Box
                          position="absolute"
                          top="0"
                          left="0"
                          right="0"
                          bottom="0"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          background="rgba(0, 0, 0, 0.3)"
                          transition="all 0.3s"
                          _hover={{
                            background: "rgba(0, 0, 0, 0.5)",
                          }}
                          cursor="pointer"
                          onClick={() => {
                            if (player.status === 'completed' && player.videoUrl) {
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
                              video.src = player.videoUrl;
                              video.controls = true;
                              video.muted = false;
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

                              closeButton.addEventListener('click', (e) => {
                                e.stopPropagation();
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
                              video.play();
                            }
                          }}
                        >
                          <IconButton
                            aria-label="Voir la déclaration"
                            icon={<ViewIcon />}
                            size="lg"
                            variant="solid"
                            colorScheme="cyan"
                            isRound
                            _hover={{
                              transform: 'scale(1.1)',
                              boxShadow: '0 0 20px rgba(129, 230, 217, 0.4)'
                            }}
                          />
                        </Box>
                      </Box>
                    ) : (
                      <Box 
                        bg={player.isCurrent ? 'rgba(129, 230, 217, 0.1)' : 'rgba(159, 122, 234, 0.1)'} 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="center"
                      >
                        {player.status === 'waiting' && (
                          <Text color="gray.300" fontSize="sm" fontWeight="medium">
                            En attente
                          </Text>
                        )}
                        {player.isCurrent && !isPresent && (
                          <Text color="cyan.400" fontSize="sm" fontWeight="medium">
                            À vous de jouer !
                          </Text>
                        )}
                      </Box>
                    )}
                  </AspectRatio>
                  <Box p={4}>
                    <HStack spacing={3} justify="space-between">
                      <HStack spacing={3}>
                        <Avatar size="sm" src={player.avatar} name={player.username} />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold">{player.username}</Text>
                          <Text 
                            fontSize="sm" 
                            color={
                              player.isCurrent ? 'blue.500' : 'gray.500'
                            }
                          >
                            {player.isCurrent && !isPresent ? (
                              <Button
                                size="sm"
                                colorScheme="blue"
                                leftIcon={<CheckIcon />}
                                onClick={confirmPresence}
                              >
                                Je suis là
                              </Button>
                            ) : 'En attente'}
                          </Text>
                        </VStack>
                      </HStack>
                    </HStack>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        </VStack>

        <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
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
              Votre Rôle Secret
            </ModalHeader>
            <ModalBody p={0}>
              <VStack spacing={0}>
                <Box 
                  w="full"
                  bg="rgba(26, 32, 44, 0.95)"
                  p={6}
                >
                  <VStack spacing={4}>
                    <Box
                      borderRadius="xl"
                      borderWidth="3px"
                      borderColor="purple.500"
                      overflow="hidden"
                      w="200px"
                      h="200px"
                      boxShadow="xl"
                      position="relative"
                    >
                      {selectedRole && (
                        <Image
                          src={selectedRole.realRole.image}
                          alt={selectedRole.realRole.name}
                          w="100%"
                          h="100%"
                          objectFit="cover"
                        />
                      )}
                    </Box>
                    <VStack spacing={2}>
                      <Heading size="lg" color="cyan.400" textAlign="center">
                        {selectedRole?.realRole.name}
                      </Heading>
                      <Text textAlign="center" color="gray.300" fontSize="md" maxW="400px">
                        {selectedRole?.realRole.description}
                      </Text>
                    </VStack>
                  </VStack>
                </Box>

                <Box 
                  w="full"
                  bg="rgba(26, 32, 44, 0.95)" 
                  p={6}
                  borderTopWidth="2px"
                  borderTopColor="purple.500"
                >
                  <VStack spacing={4}>
                    <Text fontSize="md" textAlign="center" color="cyan.400">
                      Enregistrez-vous en disant à voix haute :
                    </Text>
                    <Text 
                      fontSize="lg" 
                      fontWeight="bold" 
                      color="white"
                      bg="rgba(129, 230, 217, 0.1)"
                      px={4}
                      py={2}
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="cyan.500"
                      boxShadow="0 0 10px rgba(129, 230, 217, 0.2)"
                    >
                      "Je jure de garder mon rôle secret et de jouer 
                      avec honneur. Je déclare publiquement que 
                      je ne suis ni Woolfy, ni un Piégé."
                    </Text>

                    <Box
                      w="full"
                      maxW="400px"
                      borderRadius="xl"
                      borderWidth="2px"
                      borderColor="cyan.500"
                      overflow="hidden"
                      position="relative"
                    >
                      <AspectRatio ratio={16/9}>
                        <video
                          ref={modalVideoRef}
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
                      {mediaRecorderRef.current?.state === 'recording' && (
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

                    <HStack spacing={4}>
                      {!recordedVideoUrl ? (
                        mediaRecorderRef.current?.state !== 'recording' ? (
                          <Button
                            leftIcon={<ViewIcon />}
                            colorScheme="cyan"
                            onClick={() => {
                              if (mediaRecorderRef.current && stream) {
                                mediaRecorderRef.current.start();
                                toast({
                                  title: 'Enregistrement démarré',
                                  description: 'Attention : vous n\'aurez qu\'une seule chance d\'enregistrement. Soyez sincère !',
                                  status: 'warning',
                                  duration: 5000,
                                });
                              }
                            }}
                          >
                            Démarrer l'enregistrement unique
                          </Button>
                        ) : (
                          <Button
                            leftIcon={<ViewOffIcon />}
                            colorScheme="red"
                            onClick={() => {
                              if (mediaRecorderRef.current) {
                                mediaRecorderRef.current.stop();
                                if (stream) {
                                  stream.getTracks().forEach(track => track.stop());
                                  setStream(null);
                                }
                                toast({
                                  title: 'Enregistrement terminé',
                                  description: 'Votre déclaration a été enregistrée de manière définitive.',
                                  status: 'info',
                                  duration: 3000,
                                });
                              }
                            }}
                          >
                            Terminer l'enregistrement
                          </Button>
                        )
                      ) : (
                        <Text color="cyan.400" fontStyle="italic">
                          Votre déclaration a été enregistrée
                        </Text>
                      )}
                    </HStack>

                    {recordedVideoUrl && (
                      <Text color="red.400" fontSize="sm" fontWeight="bold">
                        Votre déclaration a été enregistrée. Cette vidéo servira de preuve en cas de trahison.
                      </Text>
                    )}
                  </VStack>
                </Box>

                <Box p={4} w="full" bg="rgba(26, 32, 44, 0.95)">
                  <Button
                    bg="cyan.500"
                    color="white"
                    size="lg"
                    onClick={confirmRole}
                    w="full"
                    fontSize="lg"
                    fontWeight="bold"
                    isDisabled={!recordedVideoUrl}
                    _hover={{
                      bg: 'cyan.600',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 0 20px rgba(129, 230, 217, 0.4)'
                    }}
                  >
                    {recordedVideoUrl ? 'Confirmer mon rôle (irréversible)' : 'Enregistrez-vous d\'abord'}
                  </Button>
                </Box>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  )
} 