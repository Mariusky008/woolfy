import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Text,
  Badge,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue
} from '@chakra-ui/react';
import { useRankingStore } from '../../stores/rankingStore';

interface RankingTableProps {
  userId?: string;
  showContext?: boolean;
}

export const RankingTable: React.FC<RankingTableProps> = ({ userId, showContext = false }) => {
  const {
    globalRanking,
    userContext,
    isLoading,
    error,
    fetchGlobalRanking,
    fetchUserContext
  } = useRankingStore();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const highlightColor = useColorModeValue('blue.50', 'blue.900');

  React.useEffect(() => {
    if (showContext && userId) {
      fetchUserContext(userId);
    } else {
      fetchGlobalRanking();
    }
  }, [showContext, userId]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  const renderRankBadge = (rank: string) => {
    let color;
    switch (rank) {
      case 'Grand Alpha':
        color = 'red';
        break;
      case 'Loup Légendaire':
        color = 'purple';
        break;
      case 'Loup Alpha':
        color = 'orange';
        break;
      case 'Loup Solitaire':
        color = 'green';
        break;
      default:
        color = 'gray';
    }
    return <Badge colorScheme={color}>{rank}</Badge>;
  };

  const renderPlayers = () => {
    if (showContext && userContext) {
      return (
        <>
          {userContext.above.map((player) => (
            <Tr key={player.userId}>
              <Td>{player.position}</Td>
              <Td>{player.username}</Td>
              <Td>{renderRankBadge(player.rank)}</Td>
              <Td isNumeric>{player.points}</Td>
            </Tr>
          ))}
          <Tr bg={highlightColor}>
            <Td>{userContext.user.position}</Td>
            <Td fontWeight="bold">{userContext.user.username}</Td>
            <Td>{renderRankBadge(userContext.user.rank)}</Td>
            <Td isNumeric fontWeight="bold">{userContext.user.points}</Td>
          </Tr>
          {userContext.below.map((player) => (
            <Tr key={player.userId}>
              <Td>{player.position}</Td>
              <Td>{player.username}</Td>
              <Td>{renderRankBadge(player.rank)}</Td>
              <Td isNumeric>{player.points}</Td>
            </Tr>
          ))}
        </>
      );
    }

    return globalRanking.map((player) => (
      <Tr key={player.userId} bg={player.userId === userId ? highlightColor : undefined}>
        <Td>{player.position}</Td>
        <Td>{player.username}</Td>
        <Td>{renderRankBadge(player.rank)}</Td>
        <Td isNumeric>{player.points}</Td>
      </Tr>
    ));
  };

  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      shadow="sm"
    >
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Position</Th>
            <Th>Joueur</Th>
            <Th>Rang</Th>
            <Th isNumeric>Points</Th>
          </Tr>
        </Thead>
        <Tbody>
          {renderPlayers()}
        </Tbody>
      </Table>
    </Box>
  );
}; 