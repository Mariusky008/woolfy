import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  Button,
  Input,
  Select,
  HStack,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

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
}

// Données de test
const mockGames: Game[] = [
  {
    id: '1',
    name: 'Partie Classique',
    type: 'Standard',
    players: { current: 8, max: 15 },
    startTime: '2024-01-17T21:00:00',
    status: 'waiting',
  },
  {
    id: '2',
    name: 'Tournoi du Samedi',
    type: 'Tournament',
    players: { current: 12, max: 15 },
    startTime: '2024-01-17T22:00:00',
    theme: 'Medieval',
    status: 'waiting',
  },
]

export const GamesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const filteredGames = mockGames.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || game.type === typeFilter
    return matchesSearch && matchesType
  })

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading mb={6}>Parties Disponibles</Heading>
          <HStack spacing={4} mb={8}>
            <Input
              placeholder="Rechercher une partie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              maxW="400px"
            />
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              maxW="200px"
            >
              <option value="all">Tous les types</option>
              <option value="Standard">Standard</option>
              <option value="Tournament">Tournoi</option>
              <option value="Special">Spécial</option>
            </Select>
            <Button
              as={Link}
              to="/games/new"
              colorScheme="blue"
            >
              Créer une partie
            </Button>
          </HStack>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredGames.map((game) => (
            <Box
              key={game.id}
              p={6}
              borderRadius="lg"
              bg={bgColor}
              borderWidth="1px"
              borderColor={borderColor}
            >
              <VStack align="stretch" spacing={4}>
                <Heading size="md">{game.name}</Heading>
                {game.theme && (
                  <Text color="gray.500">Thème : {game.theme}</Text>
                )}
                <Text>Type : {game.type}</Text>
                <Text>
                  Joueurs : {game.players.current}/{game.players.max}
                </Text>
                <Text>Début : {formatTime(game.startTime)}</Text>
                <Button
                  as={Link}
                  to={`/games/${game.id}`}
                  colorScheme="blue"
                  isDisabled={game.status === 'in_progress'}
                >
                  {game.status === 'waiting' ? "S'inscrire" : 'Voir la partie'}
                </Button>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>

        {filteredGames.length === 0 && (
          <Box textAlign="center" py={8}>
            <Text>Aucune partie ne correspond à vos critères.</Text>
          </Box>
        )}
      </VStack>
    </Container>
  )
} 