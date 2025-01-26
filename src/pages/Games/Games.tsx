import React, { useState } from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Input,
  Select,
  useToast,
  Heading,
  SimpleGrid,
  Progress,
  Icon,
  Tooltip,
  Flex,
  Divider,
  InputGroup,
  InputLeftElement,
  Tag,
  TagLabel,
  TagLeftIcon,
} from '@chakra-ui/react'
import { 
  CalendarIcon, 
  TimeIcon, 
  SearchIcon,
  InfoIcon,
  StarIcon
} from '@chakra-ui/icons'
import { FaTrophy, FaCoins, FaUserFriends, FaCrown, FaMedal } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Navbar } from '../../components/Navbar'

const MotionBox = motion(Box)

interface Game {
  id: string
  name: string
  type: 'free' | 'cash' | 'classic' | 'pro' | 'elite'
  players: {
    current: number
    max: number
    min?: number
  }
  startTime: string
  duration: string
  prize?: string
  rank?: string
  status: 'waiting' | 'starting' | 'in_progress'
  isPlayerRegistered?: boolean
  rewards?: {
    badge?: string
    trophy?: string
    points?: string
  }
}

const mockGames: Game[] = [
  {
    id: '1',
    name: 'Partie Gratuite Express',
    type: 'free',
    players: { current: 3, max: 5, min: 5 },
    startTime: 'Démarre dès 4 joueurs',
    duration: '30min',
    rank: 'Débutant',
    status: 'waiting',
    rewards: {
      badge: 'Badge Loup Rapide',
      points: '+50 points de classement'
    }
  },
  {
    id: '2',
    name: 'Partie Gratuite Standard',
    type: 'free',
    players: { current: 8, max: 15, min: 15 },
    startTime: 'Démarre dès 11 joueurs',
    duration: '1h',
    rank: 'Top 1000',
    status: 'waiting',
    rewards: {
      badge: 'Badge Stratège',
      trophy: 'Trophée Meute',
      points: '+100 points de classement'
    }
  },
  {
    id: '8',
    name: 'Partie Gratuite du Midi',
    type: 'free',
    players: { current: 0, max: 15, min: 15 },
    startTime: '12:00',
    duration: '1h',
    rank: 'Top 800',
    status: 'waiting',
    rewards: {
      badge: 'Badge Loup du Midi',
      trophy: 'Trophée Meute du Jour',
      points: '+150 points de classement'
    }
  },
  {
    id: '9',
    name: 'Grande Partie Gratuite du Soir',
    type: 'free',
    players: { current: 0, max: 20, min: 20 },
    startTime: '21:00',
    duration: '1h30',
    rank: 'Top 600',
    status: 'waiting',
    rewards: {
      badge: 'Badge Loup Nocturne',
      trophy: 'Trophée Meute de Nuit',
      points: '+200 points de classement'
    }
  },
  {
    id: '7',
    name: 'Grande Partie Gratuite',
    type: 'free',
    players: { current: 12, max: 20, min: 20 },
    startTime: 'Démarre dès 15 joueurs',
    duration: '1h30',
    rank: 'Top 500',
    status: 'waiting',
    rewards: {
      badge: 'Badge Meute Alpha',
      trophy: 'Trophée Grande Meute',
      points: '+200 points de classement'
    }
  },
  {
    id: '3',
    name: 'Cash Game',
    type: 'cash',
    players: { current: 2, max: 5, min: 3 },
    startTime: '12:00',
    duration: '30min',
    prize: '5€',
    status: 'waiting',
    rewards: {
      badge: 'Badge Cash Hunter',
      points: '+25 points de classement'
    }
  },
  {
    id: '4',
    name: 'Partie Classique',
    type: 'classic',
    players: { current: 12, max: 20, min: 15 },
    startTime: '18:00',
    duration: '1h',
    prize: '20€',
    status: 'waiting',
    rewards: {
      badge: 'Badge Classique',
      trophy: 'Trophée Vétéran',
      points: '+150 points de classement'
    }
  },
  {
    id: '5',
    name: 'Tournoi Pro',
    type: 'pro',
    players: { current: 25, max: 30, min: 25 },
    startTime: '21:00',
    duration: '2h',
    prize: '500€',
    status: 'waiting',
    rewards: {
      badge: 'Badge Pro League',
      trophy: 'Trophée Champion',
      points: '+500 points de classement'
    }
  },
  {
    id: '6',
    name: 'Tournoi Élite',
    type: 'elite',
    players: { current: 18, max: 25, min: 20 },
    startTime: '21:00',
    duration: '3h',
    rank: 'Top 100',
    prize: '1000€',
    status: 'waiting',
    rewards: {
      badge: 'Badge Élite',
      trophy: 'Trophée Légendaire',
      points: '+1000 points de classement'
    }
  }
]

const getGameTypeInfo = (type: Game['type']) => {
  switch (type) {
    case 'free':
      return {
        icon: FaUserFriends,
        color: 'green.400',
        label: 'Gratuit'
      }
    case 'cash':
      return {
        icon: FaCoins,
        color: 'yellow.400',
        label: 'Cash Game'
      }
    case 'classic':
      return {
        icon: FaMedal,
        color: 'blue.400',
        label: 'Classique'
      }
    case 'pro':
      return {
        icon: FaTrophy,
        color: 'purple.400',
        label: 'Pro'
      }
    case 'elite':
      return {
        icon: FaCrown,
        color: 'orange.400',
        label: 'Élite'
      }
  }
}

export const GamesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [registeredGames, setRegisteredGames] = useState<Set<string>>(new Set())
  const toast = useToast()

  const canGameStart = (game: Game) => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinutes = now.getMinutes()
    const minRequired = game.players.min ? Math.ceil(game.players.min * 0.7) : game.players.max
    
    // Pour les parties qui démarrent à une heure fixe (classic, pro, elite, cash)
    if (game.type === 'classic' || game.type === 'pro' || game.type === 'elite' || game.type === 'cash') {
      if (game.startTime.includes(':')) {
        const [startHour, startMinutes] = game.startTime.split(':').map(Number)
        const isTimeReached = 
          currentHour > startHour || 
          (currentHour === startHour && currentMinutes >= startMinutes)
        
        return isTimeReached && game.players.current >= minRequired
      }
    }
    
    // Pour les parties gratuites qui démarrent quand le nombre de joueurs est atteint
    return game.players.current >= minRequired
  }

  const getButtonText = (game: Game) => {
    if (game.status === 'in_progress') {
      return 'En cours'
    }
    
    if (!registeredGames.has(game.id)) {
      return "S'inscrire"
    }
    
    // Pour les parties avec une heure fixe (classic, pro, elite, cash)
    if (game.startTime.includes(':')) {
      const now = new Date()
      const currentTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
      
      if (currentTime < game.startTime) {
        return 'En attente du début de la partie'
      }
    }
    
    if (canGameStart(game)) {
      return 'Commencer la partie'
    }
    
    return 'En attente du début de la partie'
  }

  const handleRegister = (gameId: string) => {
    setRegisteredGames(prev => new Set([...prev, gameId]))
    
    toast({
      title: "Inscription réussie !",
      description: "Vous recevrez une notification avant le début de la partie.",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top"
    })
  }

  const handleStartGame = (gameId: string) => {
    // Redirection vers la page de distribution des rôles
    window.location.href = `/game/${gameId}/roles`
  }

  // Separate games by type
  const freeGames = mockGames.filter(game => 
    game.type === 'free' &&
    game.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (typeFilter === 'all' || game.type === typeFilter)
  )

  const paidGames = mockGames.filter(game => 
    ['cash', 'classic', 'pro', 'elite'].includes(game.type) &&
    game.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (typeFilter === 'all' || game.type === typeFilter)
  )

  const GameCard = ({ game }: { game: Game }) => {
    const typeInfo = getGameTypeInfo(game.type)
    const minRequired = game.players.min ? Math.ceil(game.players.min * 0.7) : game.players.max
    const playersNeeded = minRequired ? minRequired - game.players.current : 0

    return (
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        p={6}
        borderRadius="xl"
        bg="whiteAlpha.100"
        backdropFilter="blur(10px)"
        borderWidth="1px"
        borderColor="whiteAlpha.200"
        _hover={{ 
          transform: 'translateY(-5px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'all 0.2s'
        }}
      >
        <VStack align="stretch" spacing={4}>
          <Flex justify="space-between" align="center">
            <Tag size="lg" variant="subtle" colorScheme={game.type === 'free' ? 'green' : 'purple'}>
              <TagLeftIcon as={typeInfo.icon} />
              <TagLabel>{typeInfo.label}</TagLabel>
            </Tag>
            {game.prize && (
              <Tag size="lg" variant="subtle" colorScheme="yellow">
                <TagLeftIcon as={FaCoins} />
                <TagLabel>{game.prize}</TagLabel>
              </Tag>
            )}
            {game.rank && (
              <Tag size="lg" variant="subtle" colorScheme="blue">
                <TagLeftIcon as={StarIcon} />
                <TagLabel>{game.rank}</TagLabel>
              </Tag>
            )}
          </Flex>

          <Heading size="md">{game.name}</Heading>
          
          <HStack spacing={4}>
            <Tooltip label="Heure de début" placement="top">
              <Flex align="center" color="gray.400">
                <TimeIcon mr={2} />
                <Text>{game.startTime}</Text>
              </Flex>
            </Tooltip>
            <Tooltip label="Durée" placement="top">
              <Flex align="center" color="gray.400">
                <CalendarIcon mr={2} />
                <Text>{game.duration}</Text>
              </Flex>
            </Tooltip>
          </HStack>

          <Box>
            <Flex justify="space-between" mb={2}>
              <Text color="gray.400">
                Joueurs : {game.players.current}/{game.players.max}
              </Text>
              {playersNeeded > 0 && (
                <Text color="orange.300">
                  {playersNeeded} joueur{playersNeeded > 1 ? 's' : ''} manquant{playersNeeded > 1 ? 's' : ''}
                </Text>
              )}
            </Flex>
            <Progress 
              value={(game.players.current / game.players.max) * 100}
              colorScheme={game.type === 'free' ? 'green' : 'purple'}
              borderRadius="full"
              size="sm"
              bg="whiteAlpha.200"
            />
          </Box>

          {game.rewards && (
            <Box>
              <Text fontSize="sm" color="gray.400" mb={2}>
                Récompenses :
              </Text>
              <VStack align="start" spacing={1}>
                {game.rewards.badge && (
                  <HStack>
                    <Icon as={FaMedal} color="yellow.400" />
                    <Text fontSize="sm">{game.rewards.badge}</Text>
                  </HStack>
                )}
                {game.rewards.trophy && (
                  <HStack>
                    <Icon as={FaTrophy} color="orange.400" />
                    <Text fontSize="sm">{game.rewards.trophy}</Text>
                  </HStack>
                )}
                {game.rewards.points && (
                  <HStack>
                    <Icon as={StarIcon} color="purple.400" />
                    <Text fontSize="sm">{game.rewards.points}</Text>
                  </HStack>
                )}
              </VStack>
            </Box>
          )}

          <Button
            onClick={() => {
              if (!registeredGames.has(game.id)) {
                handleRegister(game.id)
              } else if (canGameStart(game)) {
                handleStartGame(game.id)
              }
            }}
            colorScheme={game.type === 'free' ? 'green' : 'purple'}
            isDisabled={game.status === 'in_progress' || (registeredGames.has(game.id) && !canGameStart(game))}
            size="lg"
            _hover={{ transform: 'scale(1.02)' }}
            transition="all 0.2s"
          >
            {getButtonText(game)}
          </Button>
        </VStack>
      </MotionBox>
    )
  }

  return (
    <Box bg="gray.900" minH="100vh" color="white">
      <Navbar />
      <Container maxW="container.xl" pt="100px" pb={8}>
        <VStack spacing={8} align="stretch">
          {/* Search Bar */}
          <Box 
            bg="whiteAlpha.100" 
            p={6} 
            borderRadius="xl" 
            backdropFilter="blur(10px)"
          >
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Rechercher une partie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="whiteAlpha.100"
                border="none"
                _placeholder={{ color: 'gray.400' }}
                _focus={{ 
                  outline: 'none',
                  boxShadow: '0 0 0 2px purple.500',
                  bg: 'whiteAlpha.200'
                }}
              />
            </InputGroup>
          </Box>

          {/* Free Games Section */}
          <Box>
            <Heading 
              size="xl" 
              mb={6}
              bgGradient="linear(to-r, green.400, blue.400)"
              bgClip="text"
            >
              Parties Gratuites - Devenez le Meilleur de France
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {freeGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </SimpleGrid>
          </Box>

          {/* Paid Games Section */}
          <Box mt={12}>
            <Heading 
              size="xl" 
              mb={6}
              bgGradient="linear(to-r, yellow.400, purple.400)"
              bgClip="text"
            >
              Parties Cash & Tournois - Gagnez de l'Argent
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {paidGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </SimpleGrid>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}