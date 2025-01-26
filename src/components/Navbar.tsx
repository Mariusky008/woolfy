import {
  Box,
  Flex,
  Button,
  Stack,
  useColorModeValue,
  HStack,
  Text,
  Icon,
  IconButton,
  useDisclosure,
  Badge,
  useToast
} from '@chakra-ui/react'
import { FaUser, FaSignOutAlt, FaWolfPackBattalion, FaGamepad, FaDice, FaEnvelope, FaTrophy } from 'react-icons/fa'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useMessageStore } from '../stores/messageStore'
import { ChatDrawer } from './chat/ChatDrawer'
import { useAuthStore } from '../stores/authStore'

export const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const conversations = useMessageStore((state) => state.conversations)
  const unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)
  const isInGame = location.pathname === '/game'

  const handleGameNavigation = () => {
    navigate(isInGame ? '/games' : '/game')
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la déconnexion')
      }

      toast({
        title: 'Déconnexion réussie',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      navigate('/')
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <>
      <Box 
        position="fixed" 
        top={0} 
        left={0} 
        right={0} 
        zIndex={100}
        bg="gray.900"
        borderBottom="1px solid"
        borderColor="whiteAlpha.200"
        backdropFilter="blur(10px)"
      >
        <Flex
          maxW="container.xl"
          mx="auto"
          px={4}
          py={4}
          align="center"
          justify="space-between"
        >
          {/* Logo */}
          <Icon 
            as={FaWolfPackBattalion} 
            w={8} 
            h={8} 
            color="purple.400"
            cursor="pointer"
            onClick={() => navigate('/games')}
          />

          {/* Navigation Buttons */}
          <HStack spacing={{ base: 2, md: 4 }}>
            <Button
              leftIcon={isInGame ? <FaDice /> : <FaGamepad />}
              variant="solid"
              colorScheme={isInGame ? "green" : "purple"}
              size={{ base: "sm", md: "md" }}
              onClick={handleGameNavigation}
            >
              {isInGame ? "Parties à venir" : "Partie en cours"}
            </Button>
            <Box position="relative">
              <IconButton
                aria-label="Messages"
                icon={<FaEnvelope />}
                colorScheme="purple"
                variant="ghost"
                onClick={onOpen}
              />
              {unreadCount > 0 && (
                <Badge
                  colorScheme="red"
                  borderRadius="full"
                  position="absolute"
                  top="-1"
                  right="-1"
                  px={2}
                >
                  {unreadCount}
                </Badge>
              )}
            </Box>
            <Button
              leftIcon={<FaUser />}
              variant="ghost"
              colorScheme="purple"
              size={{ base: "sm", md: "md" }}
              onClick={() => navigate('/profile')}
            >
              <Text display={{ base: "none", md: "block" }}>Profil</Text>
            </Button>
            <Button
              leftIcon={<FaSignOutAlt />}
              variant="ghost"
              colorScheme="red"
              size={{ base: "sm", md: "md" }}
              onClick={handleLogout}
            >
              <Text display={{ base: "none", md: "block" }}>Déconnexion</Text>
            </Button>
            <Link to="/ranking">
              <Button
                variant="ghost"
                leftIcon={<Icon as={FaTrophy} />}
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
              >
                Classement
              </Button>
            </Link>
          </HStack>
        </Flex>
      </Box>

      <ChatDrawer isOpen={isOpen} onClose={onClose} />
    </>
  )
} 