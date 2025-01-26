import React, { useState, useRef } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Avatar,
  Center,
  IconButton,
  useToast,
} from '@chakra-ui/react'
import { EditIcon } from '@chakra-ui/icons'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  currentAvatar: string
  currentBio: string
  onSave: (newAvatar: string, newBio: string) => void
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  currentBio,
  onSave,
}) => {
  const [avatar, setAvatar] = useState(currentAvatar)
  const [bio, setBio] = useState(currentBio)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'Fichier trop volumineux',
          description: 'L\'image ne doit pas dépasser 5MB',
          status: 'error',
          duration: 3000,
        })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onSave(avatar, bio)
      toast({
        title: 'Profil mis à jour',
        status: 'success',
        duration: 3000,
      })
      onClose()
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le profil',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader>Modifier le profil</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6}>
            <FormControl>
              <Center position="relative">
                <Avatar
                  size="2xl"
                  src={avatar}
                  cursor="pointer"
                  onClick={handleAvatarClick}
                />
                <IconButton
                  aria-label="Modifier l'avatar"
                  icon={<EditIcon />}
                  size="sm"
                  position="absolute"
                  bottom={0}
                  right={0}
                  colorScheme="purple"
                  onClick={handleAvatarClick}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </Center>
            </FormControl>

            <FormControl>
              <FormLabel>Bio</FormLabel>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Parlez-nous de vous..."
                maxLength={500}
                resize="vertical"
                minH="150px"
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Annuler
          </Button>
          <Button
            colorScheme="purple"
            onClick={handleSave}
            isLoading={isLoading}
          >
            Enregistrer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 