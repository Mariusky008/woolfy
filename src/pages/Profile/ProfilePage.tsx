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
import { GameHistoryPlayer, GameHistory as IGameHistory, Profile, ProfileStats as IProfileStats, RoleStats as IRoleStats } from '../../types/profile'
import { Navbar } from '../../components/Navbar'
import { messageService } from '../../services/MessageService'
import { useAuthStore } from '../../stores/authStore'
import { useNavigate } from 'react-router-dom'
import './styles/profile.css'

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
      <Center minH="100vh" className="profile-page">
        <div className="cyberpunk-grid" />
        <Spinner size="xl" color="var(--color-neon)" />
      </Center>
    )
  }

  // Dans la fonction ProfilePage, avant le return, ajoutons des données d'exemple :
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
    }
  ];

  // Ajout de badges d'exemple
  const sampleBadges = [
    {
      id: 'first-win',
      name: 'Première Victoire',
      rarity: 'common' as const,
      description: 'A remporté sa première partie'
    },
    {
      id: 'master-wolf',
      name: 'Maître Loup',
      rarity: 'epic' as const,
      description: 'A gagné 50 parties en tant que Loup-Garou'
    },
    {
      id: 'perfect-seer',
      name: 'Voyante Parfaite',
      rarity: 'legendary' as const,
      description: 'A correctement identifié 10 Loups-Garous consécutifs'
    }
  ];

  // Ajout des statistiques par rôle
  const sampleRoleStats = [
    {
      role: 'Loup-Garou',
      gamesPlayed: 15,
      wins: 10,
      winRate: 66.7,
      kills: 12,
      specialActions: 8
    },
    {
      role: 'Voyante',
      gamesPlayed: 12,
      wins: 8,
      winRate: 66.7,
      specialActions: 24
    },
    {
      role: 'Sorcière',
      gamesPlayed: 8,
      wins: 5,
      winRate: 62.5,
      kills: 3,
      specialActions: 12
    },
    {
      role: 'Chasseur',
      gamesPlayed: 7,
      wins: 5,
      winRate: 71.4,
      kills: 6,
      specialActions: 7
    }
  ];

  // Mise à jour des données du profil
  const profileData: Profile = {
    username: user.username,
    avatar: user.avatar || '',
    bio: user.bio || 'Chasseur de loups-garous expérimenté, spécialisé dans les accusations précises et les stratégies nocturnes.',
    joinedAt: user.createdAt,
    lastActive: user.lastActive,
    status: user.status,
    stats: {
      gamesPlayed: 42,
      gamesWon: 28,
      winRate: '66.7%',
      reputation: 1250,
      correctAccusations: 35,
      totalAccusations: 45,
      totalKills: 15,
      favoriteRole: 'Loup-Garou',
      totalPoints: 3500,
      nationalRank: 158
    },
    badges: sampleBadges,
    rank: {
      current: 'Loup Alpha',
      progress: 75,
      season: 'Saison 1',
      points: 3500,
      rank: 158,
      tier: 'Alpha',
      division: 'II'
    },
    roles: []
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
    <div className="profile-page">
      <div className="cyberpunk-grid" />
      <Navbar />
      <Container 
        maxW="container.xl" 
        className="profile-container" 
        px={{ base: 4, md: 8 }} 
        pt={{ base: "80px", md: "100px" }}
      >
        <VStack spacing={{ base: 6, md: 12 }} align="stretch">
          <Box position="relative" className="profile-header">
            <ProfileHeader profile={profileData} />
            <IconButton
              aria-label="Modifier le profil"
              icon={<EditIcon />}
              position="absolute"
              top={{ base: 4, md: 6 }}
              right={{ base: 4, md: 6 }}
              onClick={() => setShowEditProfile(true)}
              className="edit-button"
              variant="ghost"
              _hover={{
                bg: 'rgba(0, 255, 242, 0.1)',
                transform: 'scale(1.1)',
              }}
            />
          </Box>

          <Box>
            <ProfileStats stats={profileData.stats} />
          </Box>

          <Box className="ranking-section" bg="rgba(10, 10, 15, 0.95)" p={6} borderRadius="xl">
            <NationalRanking rank={profileData.rank} />
          </Box>

          <Box className="badges-section" bg="rgba(10, 10, 15, 0.95)" p={6} borderRadius="xl">
            <Heading size="md" mb={6}>Badges et Réalisations</Heading>
            <ProfileBadges badges={profileData.badges} />
          </Box>

          <Box className="role-stats-section" bg="rgba(10, 10, 15, 0.95)" p={6} borderRadius="xl">
            <Heading size="md" mb={6}>Statistiques par Rôle</Heading>
            <RoleStats roles={sampleRoleStats} />
          </Box>

          <Box className="game-history-section" bg="rgba(10, 10, 15, 0.95)" p={6} borderRadius="xl">
            <Heading size="md" mb={6}>Parties Récentes</Heading>
            <GameHistory 
              games={sampleGameHistory}
              onInvitePlayer={handleInvitePlayer}
            />
          </Box>
        </VStack>
      </Container>

      <IconButton
        aria-label="Chat"
        icon={<ChatIcon />}
        position="fixed"
        bottom="4"
        right="4"
        size="lg"
        onClick={() => setShowChat(true)}
        className="chat-button"
        variant="solid"
        bg="var(--color-neon)"
        color="black"
        _hover={{
          transform: 'scale(1.1)',
          boxShadow: '0 0 20px var(--color-neon)',
        }}
      />

      <ChatDrawer
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />

      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onSave={handleUpdateProfile}
        currentAvatar={profileData.avatar}
        currentBio={profileData.bio}
      />
    </div>
  )
}

export default ProfilePage; 