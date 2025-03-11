'use client';

import React from 'react';
import {
  Flex,
  Icon,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/providers/ThemeProvider';

export function ProfileMenu(): JSX.Element {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Call hooks unconditionally at the top level
  const defaultBgColor = useColorModeValue('white', 'gray.800');
  const defaultBorderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Menu autoSelect={false} isLazy placement="bottom-end">
      <MenuButton
        as={Button}
        rounded={'full'}
        variant={'link'}
        cursor={'pointer'}
        minW={0}
        p={1}
        className="profile-menu-button"
      >
        <Flex align="center" justify="center">
          <Avatar
            size={'sm'}
            name={user?.name || user?.email || 'User'}
            bg={isDarkMode ? '#38bdf8' : 'blue.500'}
            color={'white'}
            borderWidth={isDarkMode ? '2px' : '1px'}
            borderColor={isDarkMode ? '#38bdf8' : 'gray.200'}
            className="profile-avatar"
          />
          <Icon 
            as={ChevronDownIcon} 
            ml={1} 
            color={isDarkMode ? '#ffffff' : 'inherit'}
          />
        </Flex>
      </MenuButton>
      <MenuList
        bg={isDarkMode ? '#1e293b' : defaultBgColor}
        borderColor={isDarkMode ? '#38bdf8' : defaultBorderColor}
        borderWidth={isDarkMode ? '2px' : '1px'}
        boxShadow={isDarkMode ? '0 0 10px rgba(56, 189, 248, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)'}
        zIndex={1001}
        className="profile-menu-list"
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
  );
} 