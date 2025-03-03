import { useCallback } from 'react';
import {
  Box,
  Flex,
  IconButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useColorMode,
  Badge,
  Tooltip,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { FiBell, FiMoon, FiSun } from 'react-icons/fi';
import { useLayout } from '@/contexts/LayoutContext';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useNotification } from '@/contexts/NotificationContext';
import type { Notification } from '@/contexts/NotificationContext';

export function Navbar(): JSX.Element {
  const { toggleSidebar, isMobile } = useLayout();
  const { colorMode, toggleColorMode } = useColorMode();
  const { data: session } = useSession();
  const { notifications, handleNotificationClick } = useNotification();

  const handleSignOut = useCallback(async () => {
    await signOut({ callbackUrl: '/sign-in' });
  }, []);

  return (
    <Box
      as="nav"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex="sticky"
      bg="chakra-body-bg"
      borderBottom="1px"
      borderColor="chakra-border-color"
      px={4}
      py={2}
    >
      <Flex justify="space-between" align="center" maxW="8xl" mx="auto">
        <HStack spacing={4}>
          <IconButton
            aria-label="Toggle Sidebar"
            icon={<HamburgerIcon />}
            onClick={toggleSidebar}
            variant="ghost"
            display={{ base: 'inline-flex', lg: isMobile ? 'inline-flex' : 'none' }}
          />
          <Link href="/" passHref>
            <Button as="a" variant="ghost" fontWeight="bold" fontSize="lg">
              Test Manager
            </Button>
          </Link>
        </HStack>

        <HStack spacing={4}>
          <IconButton
            aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
            icon={colorMode === 'light' ? <Icon as={FiMoon} /> : <Icon as={FiSun} />}
            onClick={toggleColorMode}
            variant="ghost"
          />

          <Menu>
            <Tooltip label="Notifications">
              <MenuButton
                as={IconButton}
                aria-label={`Notifications ${notifications.length > 0 ? `(${notifications.length} unread)` : ''}`}
                icon={
                  <Box position="relative">
                    <Icon as={FiBell} />
                    {notifications.length > 0 && (
                      <Badge
                        position="absolute"
                        top="-2px"
                        right="-2px"
                        borderRadius="full"
                        colorScheme="red"
                        size="sm"
                        aria-hidden="true"
                      >
                        {notifications.length > 99 ? '99+' : notifications.length}
                      </Badge>
                    )}
                  </Box>
                }
                variant="ghost"
              />
            </Tooltip>
            <MenuList>
              {notifications.length === 0 ? (
                <MenuItem isDisabled>No new notifications</MenuItem>
              ) : (
                notifications.map((notification: Notification) => (
                  <MenuItem 
                    key={notification.id} 
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {notification.message}
                  </MenuItem>
                ))
              )}
            </MenuList>
          </Menu>

          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              rightIcon={
                <Avatar
                  size="sm"
                  name={session?.user?.name || 'User'}
                />
              }
            >
              {session?.user?.name || 'User'}
            </MenuButton>
            <MenuList>
              <Link href="/profile" passHref style={{ textDecoration: 'none' }}>
                <MenuItem as="div">Profile</MenuItem>
              </Link>
              <Link href="/settings" passHref style={{ textDecoration: 'none' }}>
                <MenuItem as="div">Settings</MenuItem>
              </Link>
              <MenuItem onClick={handleSignOut} color="red.500">
                Sign Out
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
} 