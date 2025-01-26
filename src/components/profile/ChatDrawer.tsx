import React from 'react'
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody
} from '@chakra-ui/react'
import { Chat } from '../chat/Chat'

interface ChatDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent bg="gray.800" color="white">
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">Messagerie</DrawerHeader>
        <DrawerBody p={0}>
          <Chat />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
} 