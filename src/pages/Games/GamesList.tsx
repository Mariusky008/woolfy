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
  Tag
} from '@chakra-ui/react'
import { 
  CalendarIcon, 
  TimeIcon, 
  StarIcon, 
  SearchIcon,
  InfoIcon
} from '@chakra-ui/icons'
import { FaTrophy, FaMoon, FaUserFriends } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { GiMagicSwirl } from 'react-icons/gi'

interface Game {
  id: string
  name: string
  type: string
  players: {
    current: number
    max: number
  }
  startTime: string
  theme?: string
  status: 'waiting' | 'starting' | 'in_progress'
  isPlayerRegistered?: boolean
  description?: string
}

const mockGames: Game[] = [
  {
    id: '1',
    name: 'Chaises Électriques',
    type: 'Néon',
    players: { current: 8, max: 15 },
    startTime: '2024-01-17T21:00:00',
    theme: 'Cyberpunk',
    status: 'waiting',
    isPlayerRegistered: true,
    description: 'Partie classique avec chaises électrifiées et néons. Rôles spéciaux: Hacker, Agent de sécurité'
  },
  {
    id: '2',
    name: 'Tournoi des Hackers',
    type: 'Tournament',
    players: { current: 12, max: 15 },
    startTime: '2024-01-17T22:00:00',
    theme: 'Matrix',
    status: 'waiting',
    isPlayerRegistered: false,
    description: 'Grand tournoi avec systèmes de piratage avancés. Bonus: Chaises avec IA intégrée'
  },
  {
    id: '3',
    name: 'Chaises Quantiques',
    type: 'Special',
    players: { current: 5, max: 12 },
    startTime: '2024-01-18T20:00:00',
    theme: 'Quantum Tech',
    status: 'waiting',
    isPlayerRegistered: false,
    description: 'Les chaises se téléportent aléatoirement. Nouveaux rôles: Physicien quantique, Saboteur temporel'
  },
  {
    id: '4',
    name: 'Partie Néon Express',
    type: 'Néon',
    players: { current: 6, max: 8 },
    startTime: '2024-01-17T19:30:00',
    status: 'waiting',
    isPlayerRegistered: false,
    description: 'Format rapide avec chaises à haute tension. Parfait pour les pauses cyber-café'
  },
  {
    id: '5',
    name: 'Mega Tournament 2077',
    type: 'Tournament',
    players: { current: 20, max: 30 },
    startTime: '2024-01-20T14:00:00',
    theme: 'Night City',
    status: 'waiting',
    isPlayerRegistered: false,
    description: 'Le plus grand tournoi du mois. Chaises augmentées et rôles exclusifs'
  },
  {
    id: '6',
    name: 'Partie Débutants',
    type: 'Standard',
    players: { current: 3, max: 10 },
    startTime: '2024-01-17T18:00:00',
    status: 'waiting',
    isPlayerRegistered: false
  },
  {
    id: '7',
    name: 'Partie Experts',
    type: 'Special',
    players: { current: 10, max: 15 },
    startTime: '2024-01-19T21:00:00',
    theme: 'Steampunk',
    status: 'waiting',
    isPlayerRegistered: false
  },
  {
    id: '8',
    name: 'Marathon Nocturne',
    type: 'Tournament',
    players: { current: 15, max: 20 },
    startTime: '2024-01-18T23:00:00',
    theme: 'Night',
    status: 'waiting',
    isPlayerRegistered: false
  }
]

export const GamesList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [games, setGames] = useState(mockGames)
  const toast = useToast()

  const handleRegistration = (gameId: string) => {
    setGames(prevGames => 
      prevGames.map(game => 
        game.id === gameId 
          ? { ...game, isPlayerRegistered: true } 
          : game
      )
    )
    
    toast({
      title: "Inscription réussie !",
      description: "Vous serez notifié quand la partie commencera",
      status: "success",
      duration: 5000,
      isClosable: true,
      position: "top-right",
    })
  }

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || game.type === typeFilter
    return matchesSearch && matchesType
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getStatusColor = (game: Game) => {
    if (game.players.current >= game.players.max) return 'red.500'
    if (game.players.current >= game.players.max * 0.8) return 'orange.500'
    return 'cyan.500'
  }

  const getStatusText = (game: Game) => {
    if (game.players.current >= game.players.max) return 'Complet'
    if (game.players.current >= game.players.max * 0.8) return 'Presque plein'
    return 'Places disponibles'
  }

  const getGameStatus = (game: Game) => {
    const now = new Date()
    const startTime = new Date(game.startTime)
    const hasEnoughPlayers = game.players.current >= Math.ceil(game.players.max * 0.7) // 70% des joueurs requis
    
    if (game.status === 'in_progress') return 'in_progress'
    if (now >= startTime && hasEnoughPlayers) return 'ready'
    if (game.players.current >= game.players.max) return 'full'
    return 'waiting'
  }

  return (
    <Box minH="100vh" bg="gray.900" backgroundImage="linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url('/cyber-bg.jpg')" backgroundSize="cover" color="white">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* En-tête */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Heading size="xl" bgGradient="linear(to-r, cyan.400, purple.500)" bgClip="text">
              Parties Disponibles
            </Heading>
            <Button
              as={Link}
              to="/profilepage"
              leftIcon={<Icon as={FaUserFriends} />}
              bg="cyan.500"
              color="white"
              size="lg"
              _hover={{
                bg: 'cyan.600',
                transform: 'translateY(-2px)',
                boxShadow: '0 0 20px rgba(129, 230, 217, 0.4)'
              }}
            >
              Mon Profil
            </Button>
          </Flex>

          {/* Filtres */}
          <Box 
            bg="rgba(26, 32, 44, 0.8)" 
            p={6} 
            borderRadius="xl" 
            borderWidth="1px" 
            borderColor="purple.500"
            boxShadow="0 0 20px rgba(159, 122, 234, 0.3)"
          >
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="purple.400" />
                </InputLeftElement>
                <Input
                  placeholder="Rechercher une partie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg="gray.800"
                  border="1px solid"
                  borderColor="purple.500"
                  _placeholder={{ color: "purple.200" }}
                  _focus={{ 
                    borderColor: 'cyan.400',
                    boxShadow: '0 0 10px rgba(129, 230, 217, 0.4)'
                  }}
                />
              </InputGroup>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                bg="gray.800"
                border="1px solid"
                borderColor="purple.500"
                _focus={{
                  borderColor: 'cyan.400',
                  boxShadow: '0 0 10px rgba(129, 230, 217, 0.4)'
                }}
              >
                <option value="all">Tous les types</option>
                <option value="Néon">Néon</option>
                <option value="Tournament">Tournoi</option>
                <option value="Special">Spécial</option>
              </Select>
            </SimpleGrid>
          </Box>

          {/* Liste des parties */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredGames.map((game) => (
              <Box
                key={game.id}
                p={6}
                borderRadius="lg"
                bg="rgba(26, 32, 44, 0.8)"
                borderWidth="1px"
                borderColor="purple.500"
                transition="all 0.3s"
                position="relative"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 'lg',
                  background: 'linear-gradient(45deg, transparent 0%, rgba(159, 122, 234, 0.1) 100%)',
                  zIndex: 0
                }}
                _hover={{
                  transform: 'translateY(-4px)',
                  boxShadow: '0 0 30px rgba(159, 122, 234, 0.4)'
                }}
              >
                <VStack align="stretch" spacing={4} position="relative">
                  <Flex justify="space-between" align="center">
                    <Heading size="md" color="cyan.400">{game.name}</Heading>
                    <Tag size="sm" bg={game.type === 'Tournament' ? 'purple.500' : game.type === 'Special' ? 'cyan.500' : 'blue.500'} color="white">
                      {game.type}
                    </Tag>
                  </Flex>
                  
                  {game.theme && (
                    <HStack>
                      <Icon as={GiMagicSwirl} color="purple.400" />
                      <Text color="purple.200">Thème : {game.theme}</Text>
                    </HStack>
                  )}

                  <Text color="gray.300" fontSize="sm">{game.description}</Text>

                  <HStack>
                    <Icon as={FaUserFriends} color="cyan.400" />
                    <Text>
                      {game.players.current}/{game.players.max} joueurs
                    </Text>
                    <Tag size="sm" bg={getStatusColor(game)} color="white">
                      {getStatusText(game)}
                    </Tag>
                  </HStack>

                  <HStack>
                    <Icon as={TimeIcon} color="cyan.400" />
                    <Text>{formatDate(game.startTime)}</Text>
                  </HStack>

                  <Button
                    bg={game.isPlayerRegistered ? 'cyan.500' : 'purple.500'}
                    color="white"
                    size="lg"
                    isDisabled={game.players.current >= game.players.max && !game.isPlayerRegistered}
                    onClick={() => !game.isPlayerRegistered && handleRegistration(game.id)}
                    _hover={{
                      bg: game.isPlayerRegistered ? 'cyan.600' : 'purple.600',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 0 20px rgba(159, 122, 234, 0.4)'
                    }}
                  >
                    {game.isPlayerRegistered ? 'Inscrit' : "S'inscrire"}
                  </Button>

                  {game.isPlayerRegistered && getGameStatus(game) === 'ready' && (
                    <Button
                      as={Link}
                      to={`/games/${game.id}`}
                      bg="green.500"
                      color="white"
                      size="lg"
                      mt={2}
                      leftIcon={<Icon as={FaTrophy} />}
                      _hover={{
                        bg: 'green.600',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 0 20px rgba(72, 187, 120, 0.4)'
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/games/${game.id}`;
                      }}
                    >
                      Rejoindre la partie
                    </Button>
                  )}

                  {game.isPlayerRegistered && getGameStatus(game) === 'waiting' && (
                    <Text color="gray.300" fontSize="sm" mt={2} textAlign="center">
                      En attente d'autres joueurs...
                      <br />
                      {game.players.current}/{game.players.max} joueurs
                    </Text>
                  )}
                </VStack>
              </Box>
            ))}
          </SimpleGrid>

          {filteredGames.length === 0 && (
            <Box textAlign="center" py={8}>
              <Text fontSize="lg" color="cyan.400">Aucune partie ne correspond à vos critères.</Text>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  )
} 