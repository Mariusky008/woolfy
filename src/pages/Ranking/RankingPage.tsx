import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Select,
  Button,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { RankingTable } from '../../components/ranking/RankingTable';
import { useRankingStore } from '../../stores/rankingStore';
import { useAuthStore } from '../../stores/authStore';

export const RankingPage: React.FC = () => {
  const { user } = useAuthStore();
  const { fetchTopPlayersByRank, updateUserRank } = useRankingStore();
  const toast = useToast();
  const [selectedRank, setSelectedRank] = useState('Loup Alpha');

  const ranks = [
    'Grand Alpha',
    'Loup Légendaire',
    'Loup Alpha',
    'Loup Solitaire',
    'Louveteau'
  ];

  useEffect(() => {
    if (selectedRank) {
      fetchTopPlayersByRank(selectedRank);
    }
  }, [selectedRank]);

  const handleRankChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRank(event.target.value);
  };

  const handleUpdateRank = async () => {
    if (user) {
      try {
        await updateUserRank(user._id);
        toast({
          title: 'Rang mis à jour',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de mettre à jour le rang',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Flex align="center">
          <Heading size="xl">Classement</Heading>
          <Spacer />
          {user && (
            <Button
              colorScheme="blue"
              onClick={handleUpdateRank}
            >
              Actualiser mon rang
            </Button>
          )}
        </Flex>

        <Tabs variant="enclosed">
          <TabList>
            <Tab>Classement Global</Tab>
            {user && <Tab>Mon Classement</Tab>}
            <Tab>Top par Rang</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <RankingTable userId={user?._id} />
            </TabPanel>

            {user && (
              <TabPanel>
                <RankingTable userId={user._id} showContext={true} />
              </TabPanel>
            )}

            <TabPanel>
              <VStack spacing={4} align="stretch">
                <HStack>
                  <Text>Sélectionner un rang:</Text>
                  <Select value={selectedRank} onChange={handleRankChange}>
                    {ranks.map((rank) => (
                      <option key={rank} value={rank}>
                        {rank}
                      </option>
                    ))}
                  </Select>
                </HStack>
                <Box>
                  <RankingTable userId={user?._id} />
                </Box>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
}; 