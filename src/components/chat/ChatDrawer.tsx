import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useToast,
  Box
} from '@chakra-ui/react'
import { useEffect } from 'react'
import { messageService } from '../../services/MessageService'
import { Chat } from './Chat'

interface ChatDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const ChatDrawer = ({ isOpen, onClose }: ChatDrawerProps) => {
  const toast = useToast()

  useEffect(() => {
    if (isOpen) {
      // Connexion au service de messagerie à l'ouverture du drawer
      messageService.connect().catch((error) => {
        console.error('Erreur de connexion au service de messagerie:', error)
        toast({
          title: 'Erreur de connexion',
          description: 'Impossible de se connecter au service de messagerie',
          status: 'error',
          duration: 5000,
          isClosable: true
        })
      })

      // Chargement des conversations
      messageService.getConversations().catch((error) => {
        console.error('Erreur lors du chargement des conversations:', error)
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les conversations',
          status: 'error',
          duration: 5000,
          isClosable: true
        })
      })
    } else {
      // Déconnexion à la fermeture du drawer
      messageService.disconnect()
    }
  }, [isOpen])

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      size="md"
    >
      <DrawerOverlay />
      <DrawerContent bg="gray.800" color="white">
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          Messagerie
        </DrawerHeader>
        <DrawerBody p={4}>
          <Box h="calc(100vh - 120px)">
            <Chat />
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
} 