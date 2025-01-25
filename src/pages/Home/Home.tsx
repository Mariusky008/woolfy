import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Icon,
  Flex,
  chakra,
} from '@chakra-ui/react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaUsers, FaHeart, FaMoon, FaTrophy, FaComments, FaBrain, FaWolfPackBattalion } from 'react-icons/fa'
import type { IconType } from 'react-icons'
import { useRef } from 'react'

const MotionBox = chakra(motion.div)
const MotionFlex = chakra(motion.div)
const MotionText = chakra(motion.p)

interface Feature {
  icon: IconType;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: FaUsers,
    title: "Communauté Vibrante",
    description: "Rejoignez des milliers de joueurs passionnés du monde entier"
  },
  {
    icon: FaHeart,
    title: "Liens Authentiques",
    description: "27% de nos joueurs ont trouvé l'amitié ou l'amour sur Woolfy"
  },
  {
    icon: FaMoon,
    title: "Ambiance Unique",
    description: "Vivez des nuits palpitantes remplies de mystère et d'intrigue"
  },
  {
    icon: FaTrophy,
    title: "Tournois Excitants",
    description: "Participez à des compétitions et gagnez des récompenses"
  },
  {
    icon: FaComments,
    title: "Communication Avancée",
    description: "Chat vocal et écrit pour des parties plus immersives"
  },
  {
    icon: FaBrain,
    title: "Stratégie & Déduction",
    description: "Développez vos capacités de déduction et de persuasion"
  }
]

interface FeatureCardProps {
  icon: IconType;
  title: string;
  description: string;
  delay: number;
}

interface StatCardProps {
  number: string;
  label: string;
}

export const HomePage = () => {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 300], [0, -100])

  return (
    <Box 
      bg="gray.900" 
      minH="100vh" 
      color="white"
      overflow="hidden"
      position="relative"
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

      {/* Main Content */}
      <Container maxW="container.xl" position="relative" zIndex={1} ref={containerRef}>
        {/* Hero Section */}
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 } as any}
          pt={32}
          pb={20}
          textAlign="center"
          style={{ y }}
        >
          <MotionBox
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" } as any}
          >
            <Icon 
              as={FaWolfPackBattalion} 
              w={24} 
              h={24} 
              mb={8}
              color="purple.400"
            />
          </MotionBox>
          
          <Heading
            as="h1"
            size="4xl"
            bgGradient="linear(to-r, purple.400, pink.400)"
            bgClip="text"
            letterSpacing="tight"
            mb={6}
            fontWeight="black"
          >
            WOOLFY
          </Heading>
          
          <MotionText
            fontSize="2xl"
            color="whiteAlpha.800"
            maxW="2xl"
            mx="auto"
            mb={12}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 } as any}
          >
            Plongez dans une expérience sociale unique où mystère, 
            stratégie et connexions humaines se rencontrent
          </MotionText>

          <MotionFlex
            display="flex"
            justifyContent="center"
            gap={6}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 } as any}
          >
            <Button
              size="lg"
              bg="purple.500"
              _hover={{ bg: 'purple.600', transform: 'translateY(-2px)' }}
              transition="all 0.2s"
              onClick={() => navigate('/auth')}
              px={8}
            >
              Jouer maintenant
            </Button>
            <Button
              size="lg"
              variant="outline"
              borderColor="purple.500"
              _hover={{ bg: 'whiteAlpha.100', transform: 'translateY(-2px)' }}
              transition="all 0.2s"
              onClick={() => navigate('/auth')}
              px={8}
            >
              Participer
            </Button>
          </MotionFlex>
        </MotionBox>

        {/* Features Grid */}
        <SimpleGrid 
          columns={{ base: 1, md: 3 }} 
          gap={10}
          py={20}
        >
          <FeatureCard
            icon={FaMoon}
            title="Nuits Mystérieuses"
            description="Chaque partie est une nouvelle histoire à écrire dans l'obscurité"
            delay={0.3}
          />
          <FeatureCard
            icon={FaUsers}
            title="Communauté Vibrante"
            description="Des milliers de joueurs connectés par la passion du jeu"
            delay={0.5}
          />
          <FeatureCard
            icon={FaComments}
            title="Liens Authentiques"
            description="27% de nos joueurs ont trouvé l'amitié ou l'amour"
            delay={0.7}
          />
        </SimpleGrid>

        {/* Stats Section */}
        <Box py={20}>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
            <StatCard number="100K+" label="Joueurs Actifs" />
            <StatCard number="1M+" label="Parties Jouées" />
            <StatCard number="92%" label="Taux de Fidélité" />
          </SimpleGrid>
        </Box>

        {/* Competition Section */}
        <Box py={20}>
          <Heading
            size="2xl"
            textAlign="center"
            bgGradient="linear(to-r, purple.400, pink.400)"
            bgClip="text"
            mb={12}
          >
            Mode Compétition
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={8} mb={8}>
            <MotionBox
              bg="whiteAlpha.100"
              p={8}
              borderRadius="xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
              viewport={{ once: true }}
            >
              <Heading size="md" mb={4} color="blue.400">Parties Gratuites</Heading>
              <VStack align="start" spacing={3}>
                <Text>• 3-30 joueurs</Text>
                <Text>• Classement français</Text>
                <Text>• Badges de progression</Text>
                <Text>• Trophées mensuels</Text>
              </VStack>
              <Button
                mt={6}
                colorScheme="blue"
                size="sm"
                onClick={() => navigate('/competition/free')}
              >
                Jouer maintenant
              </Button>
            </MotionBox>

            <MotionBox
              bg="whiteAlpha.100"
              p={8}
              borderRadius="xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
              viewport={{ once: true }}
            >
              <Heading size="md" mb={4} color="green.400">Parties Cash</Heading>
              <VStack align="start" spacing={3}>
                <Text>• 3-5 joueurs</Text>
                <Text>• 30 minutes max</Text>
                <Text>• Gains : 1€ - 4€</Text>
                <Text>• Badges exclusifs</Text>
              </VStack>
              <Button
                mt={6}
                colorScheme="green"
                size="sm"
                onClick={() => navigate('/competition/quick')}
              >
                Jouer maintenant
              </Button>
            </MotionBox>

            <MotionBox
              bg="whiteAlpha.100"
              p={8}
              borderRadius="xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
              viewport={{ once: true }}
            >
              <Heading size="md" mb={4} color="purple.400">Parties Classiques</Heading>
              <VStack align="start" spacing={3}>
                <Text>• 15-20 joueurs</Text>
                <Text>• 1 heure max</Text>
                <Text>• Gains : 10€ - 20€</Text>
                <Text>• Classement national</Text>
              </VStack>
              <Button
                mt={6}
                colorScheme="purple"
                size="sm"
                onClick={() => navigate('/competition/classic')}
              >
                Jouer maintenant
              </Button>
            </MotionBox>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
            <MotionBox
              bg="whiteAlpha.100"
              p={8}
              borderRadius="xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
              viewport={{ once: true }}
            >
              <Heading size="md" mb={4} color="orange.400">Tournois Pro</Heading>
              <VStack align="start" spacing={3}>
                <Text>• 30 joueurs</Text>
                <Text>• Parties stratégiques</Text>
                <Text>• Gains jusqu'à 500€</Text>
                <Text>• Trophées exclusifs</Text>
              </VStack>
              <Button
                mt={6}
                colorScheme="orange"
                size="sm"
                onClick={() => navigate('/competition/pro')}
              >
                Jouer maintenant
              </Button>
            </MotionBox>

            <MotionBox
              bg="whiteAlpha.100"
              p={8}
              borderRadius="xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
              viewport={{ once: true }}
            >
              <Heading size="md" mb={4} color="red.400">Tournois Élite</Heading>
              <VStack align="start" spacing={3}>
                <Text>• Top 100 français</Text>
                <Text>• Compétition mensuelle</Text>
                <Text>• Trophées légendaires</Text>
                <Text>• Titre de Champion</Text>
              </VStack>
              <Button
                mt={6}
                colorScheme="red"
                size="sm"
                onClick={() => navigate('/competition/elite')}
              >
                Participer
              </Button>
            </MotionBox>
          </SimpleGrid>

          <Box textAlign="center" mt={12}>
            <Text fontSize="sm" color="whiteAlpha.700">
              * Les gains sont soumis aux conditions générales d'utilisation et à la réglementation en vigueur
            </Text>
          </Box>
        </Box>

        {/* Final CTA */}
        <MotionBox
          textAlign="center"
          py={20}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Heading
            size="2xl"
            bgGradient="linear(to-r, purple.400, pink.400)"
            bgClip="text"
            mb={8}
          >
            Prêt à vivre l'aventure ?
          </Heading>
          <Button
            size="lg"
            bg="purple.500"
            _hover={{ bg: 'purple.600', transform: 'translateY(-2px)' }}
            onClick={() => navigate('/auth')}
            px={12}
          >
            Jouer maintenant
          </Button>
        </MotionBox>
      </Container>

      {/* Floating Elements */}
      <Box position="absolute" top={0} left={0} right={0} bottom={0} pointerEvents="none">
        {[...Array(20)].map((_, i) => (
          <MotionBox
            key={i}
            position="absolute"
            width="4px"
            height="4px"
            borderRadius="full"
            bg="purple.400"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.5 + 0.2,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            } as any}
          />
        ))}
      </Box>
    </Box>
  )
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => (
  <MotionBox
    bg="whiteAlpha.100"
    p={8}
    borderRadius="xl"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay } as any}
    viewport={{ once: true }}
    whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
  >
    <Icon as={icon} w={10} h={10} color="purple.400" mb={4} />
    <Heading size="md" mb={4}>{title}</Heading>
    <Text color="whiteAlpha.800">{description}</Text>
  </MotionBox>
)

const StatCard = ({ number, label }: StatCardProps) => (
  <MotionBox
    textAlign="center"
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
  >
    <Heading 
      size="3xl" 
      bgGradient="linear(to-r, purple.400, pink.400)"
      bgClip="text"
      mb={2}
    >
      {number}
    </Heading>
    <Text color="whiteAlpha.800" fontSize="lg">{label}</Text>
  </MotionBox>
) 