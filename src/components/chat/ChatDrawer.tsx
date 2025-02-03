import React from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Box,
  useColorModeValue,
} from '@chakra-ui/react'
import { ChatInput } from './ChatInput'
import { ChatMessages } from './ChatMessages'
import { ChatList } from './ChatList'
import { useMessageStore } from '../../stores/messageStore'

interface ChatDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onClose }) => {
  const currentConversationId = useMessageStore((state) => state.currentConversationId)
  const bgColor = useColorModeValue('white', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'rgba(0, 255, 242, 0.1)')

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay backdropFilter="blur(4px)" />
      <DrawerContent
        bg={bgColor}
        borderLeft="1px solid"
        borderColor={borderColor}
      >
        <DrawerCloseButton
          color="var(--color-neon)"
          _hover={{
            bg: 'rgba(0, 255, 242, 0.1)',
          }}
        />
        <DrawerHeader
          borderBottom="1px solid"
          borderColor={borderColor}
          color="var(--color-neon)"
          fontFamily="cyberpunk"
          fontSize="xl"
        >
          Messages
        </DrawerHeader>

        <DrawerBody p={0}>
          <VStack h="full" spacing={0}>
            {!currentConversationId ? (
              <Box
                w="full"
                h="full"
                overflowY="auto"
                sx={{
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(0, 0, 0, 0.1)',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'var(--color-neon)',
                    borderRadius: '4px',
                  },
                }}
              >
                <ChatList />
              </Box>
            ) : (
              <>
                <Box
                  flex={1}
                  w="full"
                  overflowY="auto"
                  sx={{
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'rgba(0, 0, 0, 0.1)',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'var(--color-neon)',
                      borderRadius: '4px',
                    },
                  }}
                >
                  <ChatMessages />
                </Box>
                <Box
                  p={4}
                  w="full"
                  borderTop="1px solid"
                  borderColor={borderColor}
                  bg={bgColor}
                >
                  <ChatInput />
                </Box>
              </>
            )}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
} 