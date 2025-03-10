'use client';

import React from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/providers/ThemeProvider';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { getChakraStyleProps } from '@/lib/ui-utils';

export function Header(): JSX.Element {
  const { isOpen, onToggle } = useDisclosure();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Call hooks unconditionally at the top level
  const defaultBgColor = useColorModeValue('white', 'gray.800');
  const defaultTextColor = useColorModeValue('gray.600', 'white');
  const defaultBorderColor = useColorModeValue('gray.200', 'gray.700');
  const defaultHeadingColor = useColorModeValue('gray.800', 'white');
  
  // Determine colors based on theme
  const bgColor = isDarkMode ? '#1e293b' : defaultBgColor;
  const textColor = isDarkMode ? '#f8fafc' : defaultTextColor;
  const borderColor = isDarkMode ? '#38bdf8' : defaultBorderColor;
  const headingColor = isDarkMode ? '#f8fafc' : defaultHeadingColor;
  
  // Get consistent style props for Chakra UI components
  const _darkModeProps = getChakraStyleProps(isDarkMode);

  return (
    <Box className={isDarkMode ? 'dark-mode' : ''} as="header">
      <Flex
        bg={bgColor}
        color={textColor}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4, md: 6 }}
        borderBottom={isDarkMode ? '2px' : '1px'}
        borderStyle={'solid'}
        borderColor={borderColor}
        align={'center'}
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={10}
        boxShadow={isDarkMode ? '0 0 10px rgba(56, 189, 248, 0.3)' : '0 2px 5px rgba(0, 0, 0, 0.1)'}
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
            color={isDarkMode ? '#ffffff' : 'inherit'}
            _hover={{
              bg: isDarkMode ? '#333333' : 'gray.100',
            }}
            borderWidth={isDarkMode ? '2px' : '1px'}
            borderColor={isDarkMode ? '#ffffff' : 'transparent'}
          />
        </Flex>
        
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Text
            textAlign={{ base: 'center', md: 'left' }}
            fontFamily={'heading'}
            color={headingColor}
            display={{ base: 'flex', md: 'none' }}
            fontWeight="bold"
            fontSize={isDarkMode ? 'lg' : 'md'}
          >
            Test Manager
          </Text>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}
        >
          <ThemeToggle />
          
          <Menu>
            <MenuButton
              as={Button}
              rounded={'full'}
              variant={'link'}
              cursor={'pointer'}
              minW={0}
            >
              <Flex align="center">
                <Avatar
                  size={'sm'}
                  name={user?.name || user?.email || 'User'}
                  bg={isDarkMode ? '#000000' : 'blue.500'}
                  color={isDarkMode ? '#ffffff' : 'white'}
                  borderWidth={isDarkMode ? '2px' : '1px'}
                  borderColor={isDarkMode ? '#ffffff' : 'gray.200'}
                />
                <Icon 
                  as={ChevronDownIcon} 
                  ml={1} 
                  color={isDarkMode ? '#ffffff' : 'inherit'}
                />
              </Flex>
            </MenuButton>
            <MenuList
              bg={isDarkMode ? '#000000' : defaultBgColor}
              borderColor={isDarkMode ? '#ffffff' : defaultBorderColor}
              borderWidth={isDarkMode ? '2px' : '1px'}
              boxShadow={isDarkMode ? '0 0 10px rgba(255, 255, 255, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)'}
            >
              <MenuItem 
                _hover={{
                  bg: isDarkMode ? '#333333' : 'gray.100',
                }}
                color={isDarkMode ? '#ffffff' : 'inherit'}
                fontWeight={isDarkMode ? 'bold' : 'medium'}
              >
                Profile
              </MenuItem>
              <MenuItem 
                _hover={{
                  bg: isDarkMode ? '#333333' : 'gray.100',
                }}
                color={isDarkMode ? '#ffffff' : 'inherit'}
                fontWeight={isDarkMode ? 'bold' : 'medium'}
              >
                Settings
              </MenuItem>
              <MenuDivider borderColor={isDarkMode ? '#ffffff' : defaultBorderColor} />
              <MenuItem 
                onClick={() => logout()}
                _hover={{
                  bg: isDarkMode ? '#333333' : 'gray.100',
                }}
                color={isDarkMode ? '#ffffff' : 'inherit'}
                fontWeight={isDarkMode ? 'bold' : 'medium'}
              >
                Sign Out
              </MenuItem>
            </MenuList>
          </Menu>
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
}

const MobileNav = (): JSX.Element => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Call hooks unconditionally at the top level
  const defaultBgColor = useColorModeValue('white', 'gray.800');
  const defaultBorderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Determine colors based on theme
  const bgColor = isDarkMode ? '#000000' : defaultBgColor;
  const borderColor = isDarkMode ? '#ffffff' : defaultBorderColor;
  
  return (
    <Stack
      bg={bgColor}
      p={4}
      display={{ md: 'none' }}
      position="fixed"
      top="60px"
      width="100%"
      zIndex={9}
      borderBottom={isDarkMode ? '3px' : '1px'}
      borderStyle={'solid'}
      borderColor={borderColor}
      boxShadow={isDarkMode ? '0 0 10px rgba(255, 255, 255, 0.3)' : '0 2px 5px rgba(0, 0, 0, 0.1)'}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, href }: NavItem): JSX.Element => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Call hooks unconditionally at the top level
  const defaultTextColor = useColorModeValue('gray.600', 'gray.200');
  
  // Determine colors based on theme
  const textColor = isDarkMode ? '#ffffff' : defaultTextColor;
  
  return (
    <Stack spacing={4}>
      <Box
        py={2}
        as="a"
        href={href ?? '#'}
        justifyContent="space-between"
        alignItems="center"
        _hover={{
          textDecoration: 'none',
          bg: isDarkMode ? '#333333' : 'gray.100',
        }}
        borderRadius="md"
        px={2}
        borderWidth={isDarkMode ? '1px' : '0'}
        borderColor={isDarkMode ? '#ffffff' : 'transparent'}
        boxShadow={isDarkMode ? '0 0 5px rgba(255, 255, 255, 0.3)' : 'none'}
      >
        <Text
          fontWeight={isDarkMode ? 'bold' : 'medium'}
          color={textColor}
          fontSize={isDarkMode ? 'md' : 'sm'}
        >
          {label}
        </Text>
      </Box>
    </Stack>
  );
};

interface NavItem {
  label: string;
  href?: string;
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    label: 'Projects',
    href: '/projects',
  },
  {
    label: 'Test Cases',
    href: '/test-cases',
  },
  {
    label: 'Test Runs',
    href: '/test-runs',
  },
  {
    label: 'Reports',
    href: '/reports',
  },
  {
    label: 'Settings',
    href: '/settings',
  },
]; 