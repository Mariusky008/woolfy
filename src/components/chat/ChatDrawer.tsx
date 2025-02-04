import React from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  Badge,
  Flex,
  useColorModeValue,
  Box,
} from '@chakra-ui/react'
import { FaEnvelope, FaHandsHelping } from 'react-icons/fa'
import { ChatInput } from './ChatInput'
import { ChatMessages } from './ChatMessages'
import { ChatList } from './ChatList'
import { ConversationsList } from './ConversationsList'
import { ServiceRequestsTab } from './ServiceRequestsTab'
import { useMessageStore } from '../../stores/messageStore'

interface ChatDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onClose }) => {
  const currentConversationId = useMessageStore((state) => state.currentConversationId)
  const unreadCount = useMessageStore(state => state.conversations.reduce((sum, conv) => sum + conv.unreadCount, 0))
  const serviceRequests = useMessageStore(state => state.serviceRequests)
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.300')

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay backdropFilter="blur(10px)" />
      <DrawerContent
        bg={bgColor}
        borderLeft="1px solid"
        borderColor={borderColor}
      >
        <DrawerCloseButton
          color="purple.500"
          _hover={{
            bg: 'whiteAlpha.200',
          }}
        />
        <DrawerHeader
          borderBottom="1px solid"
          borderColor={borderColor}
          color="purple.500"
          fontFamily="heading"
          fontSize="xl"
        >
          Messages
        </DrawerHeader>

        <DrawerBody p={0}>
          <Tabs isFitted variant="enclosed">
            <TabList borderBottomColor={borderColor}>
              <Tab 
                color="gray.600" 
                _selected={{ 
                  color: 'purple.500', 
                  borderColor: 'purple.500',
                  bg: 'whiteAlpha.100'
                }}
              >
                <Flex align="center" gap={2}>
                  <Icon as={FaEnvelope} />
                  <Box>Messages</Box>
                  {unreadCount > 0 && (
                    <Badge colorScheme="purple" borderRadius="full">
                      {unreadCount}
                    </Badge>
                  )}
                </Flex>
              </Tab>
              <Tab 
                color="gray.600" 
                _selected={{ 
                  color: 'purple.500', 
                  borderColor: 'purple.500',
                  bg: 'whiteAlpha.100'
                }}
              >
                <Flex align="center" gap={2}>
                  <Icon as={FaHandsHelping} />
                  <Box>Services</Box>
                  {serviceRequests.length > 0 && (
                    <Badge colorScheme="purple" borderRadius="full">
                      {serviceRequests.length}
                    </Badge>
                  )}
                </Flex>
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel p={0}>
                <ConversationsList />
              </TabPanel>
              <TabPanel p={0}>
                <ServiceRequestsTab />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
} 