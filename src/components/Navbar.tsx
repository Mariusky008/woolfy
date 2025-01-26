import {
  Box,
  Flex,
  Button,
  Icon,
  useToast,
  HStack,
} from '@chakra-ui/react'
import { FaUser, FaSignOutAlt, FaWolfPackBattalion } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

export const Navbar = () => {
  const navigate = useNavigate()
  const toast = useToast()

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
        <HStack spacing={4}>
          <Button
            leftIcon={<FaUser />}
            variant="ghost"
            colorScheme="purple"
            onClick={() => navigate('/profile')}
          >
            Profil
          </Button>
          <Button
            leftIcon={<FaSignOutAlt />}
            variant="ghost"
            colorScheme="red"
            onClick={handleLogout}
          >
            Déconnexion
          </Button>
        </HStack>
      </Flex>
    </Box>
  )
} 