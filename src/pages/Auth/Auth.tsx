import {
  Box,
  Container,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
  Divider,
  HStack,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { FaEye, FaEyeSlash, FaGoogle, FaDiscord } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const MotionBox = motion(Box)

interface AuthFormData {
  firstName?: string
  lastName?: string
  username?: string
  email: string
  password: string
}

export const AuthPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<AuthFormData>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: ''
  })
  const navigate = useNavigate()
  const toast = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent, isLogin: boolean) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(isLogin ? {
          email: formData.email,
          password: formData.password
        } : formData),
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue')
      }

      toast({
        title: isLogin ? 'Connexion réussie' : 'Compte créé avec succès',
        description: isLogin ? 'Bienvenue sur Woolfy !' : 'Bienvenue dans la meute !',
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
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box 
      minH="100vh" 
      bg="gray.900"
      py={20}
      position="relative"
      overflow="hidden"
    >
      {/* Background Effect */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient="radial(circle at 50% 50%, purple.900 0%, gray.900 70%)"
        opacity={0.6}
        zIndex={0}
      />

      <Container maxW="container.sm" position="relative" zIndex={1}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          bg="whiteAlpha.100"
          p={8}
          borderRadius="xl"
          backdropFilter="blur(10px)"
        >
          <Tabs isFitted variant="soft-rounded" colorScheme="purple">
            <TabList mb={8}>
              <Tab _selected={{ bg: 'purple.500' }}>Connexion</Tab>
              <Tab _selected={{ bg: 'purple.500' }}>Inscription</Tab>
            </TabList>

            <TabPanels>
              {/* Login Panel */}
              <TabPanel>
                <VStack as="form" spacing={6} onSubmit={(e) => handleSubmit(e, true)}>
                  <Heading
                    size="xl"
                    bgGradient="linear(to-r, purple.400, pink.400)"
                    bgClip="text"
                    mb={2}
                  >
                    Bon retour !
                  </Heading>
                  <Text color="whiteAlpha.600" textAlign="center" mb={4}>
                    Prêt à rejoindre la meute ?
                  </Text>

                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input 
                      name="email"
                      type="email" 
                      placeholder="votre@email.com"
                      bg="whiteAlpha.100"
                      border="none"
                      _focus={{ bg: 'whiteAlpha.200' }}
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Mot de passe</FormLabel>
                    <InputGroup>
                      <Input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Votre mot de passe"
                        bg="whiteAlpha.100"
                        border="none"
                        _focus={{ bg: 'whiteAlpha.200' }}
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showPassword ? 'Cacher le mot de passe' : 'Montrer le mot de passe'}
                          icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                          variant="ghost"
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="purple"
                    size="lg"
                    w="full"
                    isLoading={isLoading}
                  >
                    Se connecter
                  </Button>

                  <Divider my={6} />

                  <VStack spacing={4} w="full">
                    <Button
                      w="full"
                      variant="outline"
                      leftIcon={<FaGoogle />}
                      onClick={() => {}}
                    >
                      Continuer avec Google
                    </Button>
                    <Button
                      w="full"
                      variant="outline"
                      leftIcon={<FaDiscord />}
                      onClick={() => {}}
                    >
                      Continuer avec Discord
                    </Button>
                  </VStack>
                </VStack>
              </TabPanel>

              {/* Register Panel */}
              <TabPanel>
                <VStack as="form" spacing={6} onSubmit={(e) => handleSubmit(e, false)}>
                  <Heading
                    size="xl"
                    bgGradient="linear(to-r, purple.400, pink.400)"
                    bgClip="text"
                    mb={2}
                  >
                    Rejoignez la meute !
                  </Heading>
                  <Text color="whiteAlpha.600" textAlign="center" mb={4}>
                    Créez votre compte en quelques secondes
                  </Text>

                  <HStack spacing={4} w="full">
                    <FormControl>
                      <FormLabel>Prénom</FormLabel>
                      <Input 
                        name="firstName"
                        placeholder="Votre prénom"
                        bg="whiteAlpha.100"
                        border="none"
                        _focus={{ bg: 'whiteAlpha.200' }}
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Nom</FormLabel>
                      <Input 
                        name="lastName"
                        placeholder="Votre nom"
                        bg="whiteAlpha.100"
                        border="none"
                        _focus={{ bg: 'whiteAlpha.200' }}
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                  </HStack>

                  <FormControl>
                    <FormLabel>Pseudo</FormLabel>
                    <Input 
                      name="username"
                      placeholder="Votre pseudo"
                      bg="whiteAlpha.100"
                      border="none"
                      _focus={{ bg: 'whiteAlpha.200' }}
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input 
                      name="email"
                      type="email" 
                      placeholder="votre@email.com"
                      bg="whiteAlpha.100"
                      border="none"
                      _focus={{ bg: 'whiteAlpha.200' }}
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Mot de passe</FormLabel>
                    <InputGroup>
                      <Input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Choisissez un mot de passe"
                        bg="whiteAlpha.100"
                        border="none"
                        _focus={{ bg: 'whiteAlpha.200' }}
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showPassword ? 'Cacher le mot de passe' : 'Montrer le mot de passe'}
                          icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                          variant="ghost"
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="purple"
                    size="lg"
                    w="full"
                    isLoading={isLoading}
                  >
                    Créer mon compte
                  </Button>

                  <Divider my={6} />

                  <VStack spacing={4} w="full">
                    <Button
                      w="full"
                      variant="outline"
                      leftIcon={<FaGoogle />}
                      onClick={() => {}}
                    >
                      S'inscrire avec Google
                    </Button>
                    <Button
                      w="full"
                      variant="outline"
                      leftIcon={<FaDiscord />}
                      onClick={() => {}}
                    >
                      S'inscrire avec Discord
                    </Button>
                  </VStack>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </MotionBox>
      </Container>
    </Box>
  )
} 