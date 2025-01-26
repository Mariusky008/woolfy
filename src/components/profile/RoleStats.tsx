import React from 'react'
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react'
import { 
  GiWolfHowl, 
  GiVillage, 
  GiCauldron, 
  GiCrystalBall,
  GiDeathSkull
} from 'react-icons/gi'
import { RoleStats as IRoleStats } from '../../types/profile'

const getRoleIcon = (role: string) => {
  switch (role.toLowerCase()) {
    case 'loup-garou':
      return GiWolfHowl
    case 'villageois':
      return GiVillage
    case 'sorcière':
      return GiCauldron
    case 'voyante':
      return GiCrystalBall
    default:
      return GiDeathSkull
  }
}

interface RoleStatsProps {
  roles: IRoleStats[]
}

export const RoleStats: React.FC<RoleStatsProps> = ({ roles }) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  if (!roles.length) {
    return (
      <Box
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        p={6}
      >
        <Text>Aucune statistique disponible</Text>
      </Box>
    )
  }

  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
    >
      <Box p={6}>
        <Heading size="md" mb={4}>Statistiques par Rôle</Heading>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Rôle</Th>
              <Th isNumeric>Parties</Th>
              <Th isNumeric>Victoires</Th>
              <Th isNumeric>Win Rate</Th>
              <Th isNumeric>Kills</Th>
              <Th isNumeric>Actions Spéciales</Th>
            </Tr>
          </Thead>
          <Tbody>
            {roles.map((role) => (
              <Tr key={role.role}>
                <Td>
                  <Badge colorScheme={getRoleColor(role.role)}>
                    {role.role}
                  </Badge>
                </Td>
                <Td isNumeric>{role.gamesPlayed}</Td>
                <Td isNumeric>{role.wins}</Td>
                <Td isNumeric>
                  <Badge
                    colorScheme={getWinRateColor(role.winRate)}
                  >
                    {role.winRate.toFixed(1)}%
                  </Badge>
                </Td>
                <Td isNumeric>{role.kills || '-'}</Td>
                <Td isNumeric>{role.specialActions || '-'}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  )
}

function getRoleColor(role: string): string {
  switch (role.toLowerCase()) {
    case 'loup-garou':
      return 'red'
    case 'voyante':
      return 'purple'
    case 'sorcière':
      return 'green'
    case 'chasseur':
      return 'orange'
    case 'cupidon':
      return 'pink'
    default:
      return 'gray'
  }
}

function getWinRateColor(winRate: number): string {
  if (winRate >= 70) return 'green'
  if (winRate >= 50) return 'blue'
  if (winRate >= 30) return 'yellow'
  return 'red'
} 