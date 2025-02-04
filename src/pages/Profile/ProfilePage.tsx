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
  Heading,
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
import { ServicesSection } from '../../components/profile/ServicesSection'
import { GameHistoryPlayer, GameHistory as IGameHistory, Profile, ProfileStats as IProfileStats, RoleStats as IRoleStats, ProfileRank } from '../../types/profile'
import { Navbar } from '../../components/Navbar'
import { messageService } from '../../services/MessageService'
import { useAuthStore } from '../../stores/authStore'
import { useNavigate } from 'react-router-dom'
import './styles/profile.css'

const convertUserToProfile = (user: any): Profile => {
  return {
    username: user.username || '',
    avatar: user.avatar || '',
    bio: user.bio || '',
    joinedAt: user.createdAt || new Date(),
    lastActive: user.lastActive || new Date(),
    status: user.status || 'offline',
    stats: {
      gamesPlayed: user.gamesPlayed || 0,
      gamesWon: user.gamesWon || 0,
      winRate: user.gamesPlayed ? `${((user.gamesWon / user.gamesPlayed) * 100).toFixed(1)}%` : '0%',
      reputation: user.points || 0,
      correctAccusations: user.correctAccusations || 0,
      totalAccusations: user.totalAccusations || 0,
      totalKills: user.totalKills || 0,
      favoriteRole: user.favoriteRole || '',
      totalPoints: user.points || 0,
      nationalRank: 0
    },
    badges: user.badges?.map((id: string) => ({
      id,
      name: 'Badge',
      rarity: 'common' as const,
      description: ''
    })) || [],
    rank: {
      current: user.rank || 'Louveteau',
      progress: 0,
      season: 'Saison 1',
      points: user.points || 0,
      rank: 0,
      tier: user.rank || 'Louveteau',
      division: 'IV'
    },
    roles: []
  }
}

export const ProfilePage: React.FC = () => {
  const [showChat, setShowChat] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [gameHistory, setGameHistory] = useState<IGameHistory[]>([])
  const [roleStats, setRoleStats] = useState<IRoleStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()
  const navigate = useNavigate()
  const { user: authUser, isAuthenticated } = useAuthStore()
  const [user, setUser] = useState<Profile>(convertUserToProfile(authUser || {}))

  // Rediriger vers la page de connexion si non authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth')
    }
  }, [isAuthenticated, navigate])

  // Charger l'historique des parties et les statistiques par rôle
  useEffect(() => {
    if (authUser) {
      console.log('Auth user data:', authUser);
      const convertedProfile = convertUserToProfile(authUser);
      console.log('Converted profile:', convertedProfile);
      setUser(convertedProfile);
      
      // Utiliser les données d'exemple
      const sampleGameHistory: IGameHistory[] = [
        {
          id: '1',
          type: 'classic',
          date: '2024-03-20',
          duration: '15:30',
          role: 'Loup-Garou',
          result: 'Victoire',
          points: 150,
          players: [
            {
              id: '2',
              username: 'AlphaWolf',
              avatar: 'https://i.pravatar.cc/150?img=1',
              role: 'Villageois',
              result: 'Défaite',
              reputation: 1200
            },
            {
              id: '3',
              username: 'MysticSeer',
              avatar: 'https://i.pravatar.cc/150?img=2',
              role: 'Voyante',
              result: 'Défaite',
              reputation: 980
            },
            {
              id: '4',
              username: 'NightHunter',
              avatar: 'https://i.pravatar.cc/150?img=3',
              role: 'Chasseur',
              result: 'Défaite',
              reputation: 1500
            }
          ]
        },
        {
          id: '2',
          type: 'elite',
          date: '2024-03-19',
          duration: '20:45',
          role: 'Voyante',
          result: 'Victoire',
          points: 200,
          players: [
            {
              id: '5',
              username: 'ShadowBite',
              avatar: 'https://i.pravatar.cc/150?img=4',
              role: 'Loup-Garou',
              result: 'Défaite',
              reputation: 2200
            },
            {
              id: '6',
              username: 'MoonHowler',
              avatar: 'https://i.pravatar.cc/150?img=5',
              role: 'Sorcière',
              result: 'Victoire',
              reputation: 1800
            }
          ]
        },
        {
          id: '3',
          type: 'pro',
          date: '2024-03-18',
          duration: '12:15',
          role: 'Chasseur',
          result: 'Défaite',
          points: -50,
          players: [
            {
              id: '7',
              username: 'WolfSlayer',
              avatar: 'https://i.pravatar.cc/150?img=6',
              role: 'Loup-Garou',
              result: 'Victoire',
              reputation: 1650
            },
            {
              id: '8',
              username: 'NightOracle',
              avatar: 'https://i.pravatar.cc/150?img=7',
              role: 'Voyante',
              result: 'Défaite',
              reputation: 1100
            }
          ]
        }
      ];

      // Ajout des statistiques par rôle
      const sampleRoleStats = [
        {
          role: 'Loup-Garou',
          gamesPlayed: 25,
          wins: 18,
          winRate: 72.0,
          kills: 45,
          specialActions: 30,
          averageGameDuration: '18:30',
          bestStreak: 5
        },
        {
          role: 'Voyante',
          gamesPlayed: 20,
          wins: 14,
          winRate: 70.0,
          specialActions: 60,
          correctPredictions: 52,
          averageGameDuration: '16:45',
          bestStreak: 4
        },
        {
          role: 'Sorcière',
          gamesPlayed: 15,
          wins: 10,
          winRate: 66.7,
          kills: 8,
          specialActions: 25,
          potionsUsed: 28,
          averageGameDuration: '15:20',
          bestStreak: 3
        },
        {
          role: 'Chasseur',
          gamesPlayed: 18,
          wins: 12,
          winRate: 66.7,
          kills: 15,
          specialActions: 16,
          revengeKills: 10,
          averageGameDuration: '17:15',
          bestStreak: 3
        },
        {
          role: 'Cupidon',
          gamesPlayed: 12,
          wins: 8,
          winRate: 66.7,
          specialActions: 12,
          successfulCouples: 9,
          averageGameDuration: '19:30',
          bestStreak: 2
        }
      ];

      setGameHistory(sampleGameHistory);
      setRoleStats(sampleRoleStats);
      setIsLoading(false);
    } else {
      console.log('No auth user data available');
    }
  }, [authUser]);

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

  if (!authUser) {
    return (
      <Center minH="100vh" className="profile-page">
        <div className="cyberpunk-grid" />
        <Spinner size="xl" color="var(--color-neon)" />
      </Center>
    )
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
    <Box className="profile-page">
      <div className="cyberpunk-grid" />
      <Navbar />
      <Container maxW="container.xl" py={8} mt="80px">
        <VStack spacing={8} align="stretch">
          <ProfileHeader
            profile={user}
            onEditClick={() => setShowEditProfile(true)}
            onChatClick={() => setShowChat(true)}
          />

          {/* Ligne dédiée aux statistiques */}
          <Box w="100%">
            <ProfileStats stats={user.stats} />
          </Box>

          {/* Contenu principal */}
          <Grid
            templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
            gap={8}
          >
            <GridItem>
              <VStack spacing={8} align="stretch">
                <ServicesSection />
                <GameHistory
                  games={gameHistory}
                  onInvitePlayer={handleInvitePlayer}
                />
                <RoleStats roles={roleStats} />
              </VStack>
            </GridItem>

            <GridItem>
              <VStack spacing={8} align="stretch">
                <ProfileBadges badges={user.badges} />
                <NationalRanking rank={user.rank} />
              </VStack>
            </GridItem>
          </Grid>
        </VStack>
      </Container>

      <ChatDrawer
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />

      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onSave={handleUpdateProfile}
        currentAvatar={user.avatar}
        currentBio={user.bio}
      />
    </Box>
  )
}

export default ProfilePage; 