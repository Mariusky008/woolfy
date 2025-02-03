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
    isCurrent: false 
  },
  { 
    id: '2', 
    username: 'Charlie', 
    avatar: 'https://bit.ly/prosper-baba',
    status: 'completed',
    isCurrent: false 
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
      name: 'Loup-Garou',
      image: 'https://images.unsplash.com/photo-1615812214207-34e3be6812df?w=800&auto=format&fit=crop',
      description: 'Chaque nuit, vous devez dévorer un villageois avec les autres Loups-Garous.'
    }
  },
  {
    id: '2',
    name: 'Carte Mystère 2',
    image: 'https://placehold.co/400x600/purple/white?text=?',
    description: '',
    realRole: {
      name: 'Voyante',
      image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=800&auto=format&fit=crop',
      description: 'Chaque nuit, vous pouvez espionner le rôle d\'un autre joueur.'
    }
  },
  {
    id: '3',
    name: 'Carte Mystère 3',
    image: 'https://placehold.co/400x600/purple/white?text=?',
    description: '',
    realRole: {
      name: 'Sorcière',
      image: 'https://images.unsplash.com/photo-1596695346787-acc152b2c221?w=800&auto=format&fit=crop',
      description: 'Vous possédez deux potions : une pour guérir, une pour tuer.'
    }
  },
  {
    id: '4',
    name: 'Carte Mystère 4',
    image: 'https://placehold.co/400x600/purple/white?text=?',
    description: '',
    realRole: {
      name: 'Chasseur',
      image: 'https://images.unsplash.com/photo-1516681000991-4f0f3caa4e12?w=800&auto=format&fit=crop',
      description: 'À votre mort, vous devez immédiatement tuer un autre joueur.'
    }
  },
  {
    id: '5',
    name: 'Carte Mystère 5',
    image: 'https://placehold.co/400x600/purple/white?text=?',
    description: '',
    realRole: {
      name: 'Cupidon',
      image: 'https://images.unsplash.com/photo-1612011213721-3721d99ba012?w=800&auto=format&fit=crop',
      description: 'La première nuit, vous devez lier deux joueurs qui s\'aimeront.'
    }
  },
  {
    id: '6',
    name: 'Carte Mystère 6',
    image: 'https://placehold.co/400x600/purple/white?text=?',
    description: '',
    realRole: {
      name: 'Voleur',
      image: 'https://images.unsplash.com/photo-1594392175511-30eca83d51c8?w=800&auto=format&fit=crop',
      description: 'Au début du jeu, vous pouvez échanger votre rôle avec celui d\'un autre joueur.'
    }
  },
  {
    id: '7',
    name: 'Carte Mystère 7',
    image: 'https://placehold.co/400x600/purple/white?text=?',
    description: '',
    realRole: {
      name: 'Petite Fille',
      image: 'https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=800&auto=format&fit=crop',
      description: 'La nuit, vous pouvez espionner les Loups-Garous.'
    }
  },
  {
    id: '8',
    name: 'Carte Mystère 8',
    image: 'https://placehold.co/400x600/purple/white?text=?',
    description: '',
    realRole: {
      name: 'Villageois',
      image: 'https://images.unsplash.com/photo-1590086783191-a0694c7d1e6e?w=800&auto=format&fit=crop',
      description: 'Vous devez démasquer et éliminer les Loups-Garous.'
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
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string>('');
  const [playerVideos, setPlayerVideos] = useState<{[key: string]: string}>({
    '1': 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDd6Y2JxdWF4OWF4OWF4cWF4cWF4cWF4cWF4cWF4/l0HlvtIPzPzsNYbDi/giphy.gif',
    '2': 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDd6Y2JxdWF4OWF4OWF4cWF4cWF4cWF4cWF4cWF4/3o7TKTDn976rzVgky4/giphy.gif',
    '3': 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDd6Y2JxdWF4OWF4OWF4cWF4cWF4cWF4cWF4cWF4/l0HlKrB02QY0f1mbm/giphy.gif'
  });
  const navigate = useNavigate()

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
    setTimeout(() => {
      setSelectedRole(role)
      onOpen()
    }, 1000)
  }

  const confirmRole = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    setHasConfirmedRole(true);
    onClose();
  };

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
    const allPlayersReady = mockPlayers.every(p => p.status === 'completed');
    return hasConfirmedRole && allPlayersReady;
  };

  if (!currentPlayer) {
    return <Box>Chargement...</Box>
  }

  return (
    <Container maxW="container.xl" h="100vh" p={0}>
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
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'gray',
            borderRadius: '24px',
          },
        }}
      >
        <Box textAlign="center" w="full">
          <Heading mb={4}>Attribution des Rôles</Heading>
          <Text fontSize="lg" color="gray.600">
            Les joueurs découvrent leur rôle à tour de rôle
          </Text>
        </Box>

        {/* Section principale pour le joueur actuel */}
        {isPresent && !hasConfirmedRole && (
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} w="full">
            {/* Colonne de gauche : Caméra et cartes */}
            <VStack spacing={4}>
              <Box w="full" borderWidth={1} borderRadius="lg" overflow="hidden" p={4}>
                <Heading size="md" mb={4}>Votre Caméra</Heading>
                <AspectRatio ratio={16/9} maxH="400px" bg="gray.100">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ 
                      borderRadius: '0.5rem',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </AspectRatio>
              </Box>
            </VStack>

            {/* Colonne de droite : Cartes de rôles */}
            <Box w="full" borderWidth={1} borderRadius="lg" overflow="hidden" p={4}>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Choisissez votre rôle</Heading>
                <SimpleGrid columns={{ base: 2, sm: 2, md: 4 }} spacing={4} w="full">
                  {mockRoles.map((role) => (
                    <Box
                      key={role.id}
                      position="relative"
                      cursor="pointer"
                      onClick={() => !flippedCardId && handleRoleSelection(role)}
                      style={{ perspective: '1000px' }}
                      w="100%"
                      _hover={{
                        transform: 'translateY(-4px)',
                        transition: 'transform 0.2s'
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
        )}

        {/* Affichage des joueurs précédents */}
        <Box w="full">
          <Heading size="md" mb={4}>Joueurs qui ont découvert leur rôle</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {mockPlayers
              .filter(p => p.status === 'completed' || (p.isCurrent && hasConfirmedRole))
              .slice(0, 4)
              .map((player) => (
              <Box
                key={player.id}
                borderWidth={1}
                borderRadius="lg"
                overflow="hidden"
                bg="gray.50"
              >
                <AspectRatio ratio={16/9} maxH="200px">
                  {playerVideos[player.id] ? (
                    <video
                      src={playerVideos[player.id]}
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Box bg="gray.200" />
                  )}
                </AspectRatio>
                <Box p={4}>
                  <HStack spacing={3}>
                    <Avatar size="sm" src={player.avatar} name={player.username} />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold">{player.username}</Text>
                      <Text fontSize="sm" color="green.500">
                        Rôle découvert
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* Bouton pour commencer la partie */}
        {hasConfirmedRole && (
          <Box w="full" py={8}>
            <Button
              size="lg"
              colorScheme="green"
              w="full"
              h="16"
              fontSize="xl"
              fontWeight="bold"
              leftIcon={<CheckIcon boxSize={5} />}
              onClick={() => {
                toast({
                  title: 'La partie va commencer !',
                  description: 'Tous les joueurs ont découvert leur rôle.',
                  status: 'success',
                  duration: 3000,
                });
                // Rediriger vers la page de jeu
                navigate(`/games/${gameId}/play`);
              }}
              isDisabled={!shouldShowStartButton()}
              _hover={shouldShowStartButton() ? {
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              } : undefined}
            >
              {shouldShowStartButton() ? 'Commencer la partie' : 'En attente des autres joueurs...'}
            </Button>
          </Box>
        )}

        {/* Remplacer la liste des joueurs par une grille */}
        <Box w="full">
          <Heading size="md" mb={4}>Tous les Joueurs</Heading>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
            {mockPlayers
              .filter(player => 
                player.status !== 'completed' && 
                !(player.isCurrent && hasConfirmedRole)
              )
              .map((player) => (
              <Box
                key={player.id}
                borderWidth={1}
                borderRadius="lg"
                overflow="hidden"
                bg={player.isCurrent ? 'blue.50' : 'gray.50'}
                transition="all 0.2s"
                _hover={player.isCurrent && !isPresent ? {
                  transform: 'translateY(-4px)',
                  shadow: 'md'
                } : undefined}
              >
                <AspectRatio ratio={16/9} maxH="200px">
                  {playerVideos[player.id] ? (
                    <video
                      src={playerVideos[player.id]}
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Box 
                      bg={player.isCurrent ? 'blue.100' : 'gray.200'} 
                      display="flex" 
                      alignItems="center" 
                      justifyContent="center"
                    >
                      {player.status === 'waiting' && (
                        <Text color="gray.500" fontSize="sm" fontWeight="medium">
                          En attente
                        </Text>
                      )}
                      {player.isCurrent && !isPresent && (
                        <Text color="blue.700" fontSize="sm" fontWeight="medium">
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

        {/* Modal de confirmation du rôle */}
        <Modal 
          isOpen={isOpen} 
          onClose={onClose} 
          size="xl"
          closeOnOverlayClick={false}
          motionPreset="slideInBottom"
        >
          <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.700" />
          <ModalContent bg="gray.50" overflow="hidden">
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
                  bg="white"
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
                      <Heading size="lg" color="purple.700" textAlign="center">
                        {selectedRole?.realRole.name}
                      </Heading>
                      <Text textAlign="center" color="gray.600" fontSize="md" maxW="400px">
                        {selectedRole?.realRole.description}
                      </Text>
                    </VStack>
                  </VStack>
                </Box>
                <Box 
                  w="full"
                  bg="yellow.50" 
                  p={4}
                  borderTopWidth="2px"
                  borderTopColor="yellow.100"
                >
                  <VStack spacing={3}>
                    <Text fontSize="md" textAlign="center" color="yellow.800">
                      Pour confirmer votre rôle, dites à voix haute :
                    </Text>
                    <Text 
                      fontSize="lg" 
                      fontWeight="bold" 
                      color="yellow.900"
                      bg="yellow.100"
                      px={4}
                      py={2}
                      borderRadius="md"
                    >
                      "Je suis un Villageois"
                    </Text>
                  </VStack>
                </Box>
                <Box p={4} w="full" bg="white">
                  <Button
                    colorScheme="purple"
                    size="lg"
                    onClick={confirmRole}
                    w="full"
                    fontSize="lg"
                    fontWeight="bold"
                    boxShadow="md"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                    }}
                  >
                    J'ai terminé
                  </Button>
                </Box>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  )
} 