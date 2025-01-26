import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  IconButton,
  useToast,
  Grid,
  GridItem,
  Container,
  Spinner,
  Center,
} from '@chakra-ui/react'
import { ChatIcon, EditIcon } from '@chakra-ui/icons'
import { ProfileHeader } from '../../components/profile/ProfileHeader'
import { ProfileStats } from '../../components/profile/ProfileStats'
import { ProfileBadges } from '../../components/profile/ProfileBadges'
import { GameHistory } from '../../components/profile/GameHistory'
import { ChatDrawer } from '../../components/profile/ChatDrawer'
import { RoleStats } from '../../components/profile/RoleStats'
import { NationalRanking } from '../../components/profile/NationalRanking'
import { EditProfileModal } from '../../components/profile/EditProfileModal'
import { GameHistoryPlayer, GameHistory as IGameHistory, Profile, ProfileStats as IProfileStats, RoleStats as IRoleStats } from '../../types/profile'
import { Navbar } from '../../components/Navbar'
import { messageService } from '../../services/MessageService'
import { useAuthStore } from '../../stores/authStore'
import { useNavigate } from 'react-router-dom'

export const ProfilePage: React.FC = () => {
  const [showChat, setShowChat] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [gameHistory, setGameHistory] = useState<IGameHistory[]>([])
  const [roleStats, setRoleStats] = useState<IRoleStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()

  // Rediriger vers la page de connexion si non authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth')
    }
  }, [isAuthenticated, navigate])

  // Charger l'historique des parties et les statistiques par rôle
  useEffect(() => {
    if (user) {
      Promise.all([
        fetch(`/api/games/history/${user._id}`).then(res => res.json()),
        fetch(`/api/profile/${user._id}/roles`).then(res => res.json())
      ])
        .then(([historyData, statsData]) => {
          setGameHistory(historyData);
          setRoleStats(statsData);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          toast({
            title: 'Erreur',
            description: 'Impossible de charger les données du profil',
            status: 'error',
            duration: 5000,
            isClosable: true
          });
          setIsLoading(false);
        });
    }
  }, [user]);

  // Connect to message service when chat is opened
  useEffect(() => {
    if (showChat) {
      messageService.connect().catch((error) => {
        console.error('Error connecting to message service:', error)
        toast({
          title: 'Erreur',
          description: 'Impossible de se connecter au service de messagerie',
          status: 'error',
          duration: 5000,
          isClosable: true
        })
      })

      // Disconnect when chat is closed
      return () => {
        messageService.disconnect()
      }
    }
  }, [showChat])

  const handleInvitePlayer = (player: GameHistoryPlayer, game: IGameHistory) => {
    const message = `Hey ! On a joué ensemble le ${game.date}. Tu étais ${player.role} et j'étais ${game.role}. Ça te dit de rejouer ?`
    
    // Send game invitation through message service
    messageService.sendMessage(player.id.toString(), message, 'game_invite')
      .then(() => {
        toast({
          title: 'Invitation envoyée',
          description: `Une invitation a été envoyée à ${player.username}`,
          status: 'success',
          duration: 3000,
        })
      })
      .catch((error) => {
        console.error('Error sending game invitation:', error)
        toast({
          title: 'Erreur',
          description: 'Impossible d\'envoyer l\'invitation',
          status: 'error',
          duration: 5000,
          isClosable: true
        })
      })
  }

  const handleUpdateProfile = async (newAvatar: string, newBio: string) => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          avatar: newAvatar,
          bio: newBio,
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du profil')
      }

      toast({
        title: 'Profil mis à jour',
        status: 'success',
        duration: 3000,
      })
      setShowEditProfile(false)
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le profil',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  if (!user) {
    return (
      <Center minH="100vh" bg="gray.900">
        <Spinner size="xl" color="purple.500" />
      </Center>
    )
  }

  // Convertir les données de l'utilisateur au format attendu par les composants
  const profileData: Profile = {
    username: user.username,
    avatar: user.avatar || '',
    bio: user.bio || '',
    joinedAt: user.createdAt,
    lastActive: user.lastActive,
    status: user.status,
    stats: {
      gamesPlayed: user.gamesPlayed,
      gamesWon: user.gamesWon,
      winRate: user.gamesPlayed > 0 ? (user.gamesWon / user.gamesPlayed * 100).toFixed(1) + '%' : '0%',
      reputation: user.points,
      correctAccusations: user.correctAccusations,
      totalAccusations: user.totalAccusations,
      totalKills: user.totalKills,
      favoriteRole: user.favoriteRole,
      totalPoints: user.points,
      nationalRank: 0, // À implémenter avec le classement réel
    },
    badges: user.badges.map(badge => ({
      id: badge,
      name: badge,
      rarity: 'common' as const,
    })),
    rank: {
      current: user.rank,
      progress: calculateProgress(user.points),
      season: 'Saison 1',
      points: user.points,
      rank: 0, // Sera mis à jour avec le vrai classement
      tier: getTierFromRank(user.rank),
      division: getDivisionFromPoints(user.points).toString()
    },
    roles: [] // À implémenter avec les statistiques par rôle
  }

  // Fonctions utilitaires pour le calcul du rang
  function calculateProgress(points: number): number {
    const currentTier = getRankTier(points);
    if (!currentTier) return 0;
    
    const progressInTier = points - currentTier.minPoints;
    const tierRange = currentTier.maxPoints - currentTier.minPoints;
    return Math.min(Math.floor((progressInTier / tierRange) * 100), 100);
  }

  function getRankTier(points: number) {
    const tiers = [
      { name: 'Louveteau', minPoints: 0, maxPoints: 3999 },
      { name: 'Loup Solitaire', minPoints: 4000, maxPoints: 7999 },
      { name: 'Loup Alpha', minPoints: 8000, maxPoints: 11999 },
      { name: 'Loup Légendaire', minPoints: 12000, maxPoints: 19999 },
      { name: 'Grand Alpha', minPoints: 20000, maxPoints: Infinity }
    ];
    
    return tiers.find(tier => points >= tier.minPoints && points <= tier.maxPoints);
  }

  function getTierFromRank(rank: string): string {
    // Extraire le tier du rang (par exemple "Loup Alpha" -> "Alpha")
    const parts = rank.split(' ');
    return parts.length > 1 ? parts[parts.length - 1] : rank;
  }

  function getDivisionFromPoints(points: number): number {
    const currentTier = getRankTier(points);
    if (!currentTier) return 4;
    
    const tierRange = currentTier.maxPoints - currentTier.minPoints;
    const progressInTier = points - currentTier.minPoints;
    const divisionSize = tierRange / 4;
    
    return 4 - Math.min(Math.floor(progressInTier / divisionSize), 3);
  }

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <Navbar />
      <Container maxW="container.xl" px={{ base: 4, md: 8 }} pt={{ base: "80px", md: "100px" }}>
        <VStack spacing={{ base: 4, md: 8 }} align="stretch">
          <Box position="relative">
            <ProfileHeader profile={profileData} />
            <IconButton
              aria-label="Modifier le profil"
              icon={<EditIcon />}
              position="absolute"
              top={{ base: 4, md: 6 }}
              right={{ base: 4, md: 6 }}
              colorScheme="purple"
              variant="ghost"
              onClick={() => setShowEditProfile(true)}
            />
          </Box>

          <Grid 
            templateColumns={{ base: '1fr', lg: '2fr 1fr' }} 
            gap={{ base: 4, md: 8 }}
          >
            <GridItem>
              <VStack spacing={{ base: 4, md: 8 }} align="stretch">
                <ProfileStats stats={profileData.stats} />
                <RoleStats roles={profileData.roles} />
                {isLoading ? (
                  <Center p={8}>
                    <Spinner size="xl" color="purple.500" />
                  </Center>
                ) : (
                  <GameHistory 
                    games={gameHistory}
                    onInvitePlayer={handleInvitePlayer} 
                  />
                )}
              </VStack>
            </GridItem>

            <GridItem>
              <VStack spacing={{ base: 4, md: 8 }} align="stretch">
                <NationalRanking rank={profileData.rank} />
                <ProfileBadges profile={profileData} />
              </VStack>
            </GridItem>
          </Grid>

          {/* Bouton pour ouvrir le chat */}
          <IconButton
            aria-label="Ouvrir le chat"
            icon={<ChatIcon />}
            position="fixed"
            bottom={6}
            right={6}
            size="lg"
            colorScheme="blue"
            onClick={() => setShowChat(true)}
            zIndex={2}
          />

          {/* Chat Drawer */}
          <ChatDrawer
            isOpen={showChat}
            onClose={() => setShowChat(false)}
          />

          {/* Edit Profile Modal */}
          <EditProfileModal
            isOpen={showEditProfile}
            onClose={() => setShowEditProfile(false)}
            currentAvatar={profileData.avatar}
            currentBio={profileData.bio}
            onSave={handleUpdateProfile}
          />
        </VStack>
      </Container>
    </Box>
  )
} 