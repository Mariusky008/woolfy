import React, { useState } from 'react'
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  HStack,
  VStack,
  Avatar,
  Text,
  Tag,
  TagLeftIcon,
  TagLabel,
  Button,
} from '@chakra-ui/react'
import { ChevronUpIcon, ChevronDownIcon, AddIcon } from '@chakra-ui/icons'
import { StarIcon } from '@chakra-ui/icons'
import { GameHistory as IGameHistory, GameHistoryPlayer } from '../../types/profile'

interface GameHistoryProps {
  games: IGameHistory[]
  onInvitePlayer: (player: GameHistoryPlayer, game: IGameHistory) => void
}

export const GameHistory: React.FC<GameHistoryProps> = ({ games, onInvitePlayer }) => {
  const [selectedGame, setSelectedGame] = useState<IGameHistory | null>(null)
  const [showGamePlayers, setShowGamePlayers] = useState(false)

  return (
    <Box bg="whiteAlpha.200" p={6} borderRadius="xl">
      <Heading size="md" mb={4}>Parties Récentes</Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th color="gray.400">Date</Th>
            <Th color="gray.400">Rôle</Th>
            <Th color="gray.400">Résultat</Th>
            <Th color="gray.400">Éliminations</Th>
            <Th color="gray.400">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {games.map((game) => (
            <React.Fragment key={game.id}>
              <Tr
                cursor="pointer"
                onClick={() => {
                  setSelectedGame(game)
                  setShowGamePlayers(!showGamePlayers)
                }}
                _hover={{ bg: 'whiteAlpha.100' }}
              >
                <Td>{game.date}</Td>
                <Td>{game.role}</Td>
                <Td color={game.result === "Victoire" ? "green.400" : "red.400"}>
                  {game.result}
                </Td>
                <Td>{game.kills}</Td>
                <Td>
                  <IconButton
                    aria-label="Voir les joueurs"
                    icon={showGamePlayers && selectedGame?.id === game.id ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    variant="ghost"
                    size="sm"
                  />
                </Td>
              </Tr>
              {showGamePlayers && selectedGame?.id === game.id && (
                <Tr>
                  <Td colSpan={5}>
                    <VStack align="stretch" spacing={2} pl={4}>
                      {game.players.map((player) => (
                        <HStack key={player.id} justify="space-between" p={2} bg="whiteAlpha.50" borderRadius="md">
                          <HStack>
                            <Avatar size="sm" name={player.username} src={player.avatar} />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold">{player.username}</Text>
                              <Text fontSize="sm" color="gray.400">
                                {player.role} • {player.result}
                              </Text>
                            </VStack>
                          </HStack>
                          <HStack>
                            <Tag size="sm" colorScheme="blue">
                              <TagLeftIcon as={StarIcon} />
                              <TagLabel>{player.reputation}</TagLabel>
                            </Tag>
                            <Button
                              size="sm"
                              leftIcon={<AddIcon />}
                              colorScheme="green"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                onInvitePlayer(player, game)
                              }}
                            >
                              Inviter
                            </Button>
                          </HStack>
                        </HStack>
                      ))}
                    </VStack>
                  </Td>
                </Tr>
              )}
            </React.Fragment>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
} 