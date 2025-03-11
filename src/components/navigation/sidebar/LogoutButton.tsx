'use client';

import React from 'react';
import { 
  Flex, 
  Text, 
  Icon, 
  useColorModeValue,
  Tooltip
} from '@chakra-ui/react';
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/providers/ThemeProvider';

interface LogoutButtonProps {
  isCollapsed?: boolean;
}

export function LogoutButton({ isCollapsed }: LogoutButtonProps): JSX.Element {
  const { logout } = useAuth();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const defaultHoverBg = useColorModeValue('gray.100', 'gray.700');
  const defaultTextColor = useColorModeValue('gray.600', 'gray.200');
  
  // Determine colors based on theme
  const hoverBg = isDarkMode ? '#334155' : defaultHoverBg;
  const textColor = isDarkMode ? '#f8fafc' : defaultTextColor;
  
  const handleLogout = async (): Promise<void> => {
    await logout();
  };
  
  return (
    <Tooltip label="Logout" placement="right" hasArrow openDelay={500} isDisabled={!isCollapsed}>
      <Flex
        align="center"
        p="4"
        mx="4"
        mt="auto"
        mb="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        onClick={handleLogout}
        _hover={{
          bg: hoverBg,
        }}
        borderWidth={isDarkMode ? '1px' : '0'}
        borderColor={isDarkMode ? '#475569' : 'transparent'}
        className="nav-item"
      >
        <Icon
          mr={isCollapsed ? 0 : 4}
          fontSize="20"
          as={FiLogOut}
          color={textColor}
          display="inline-block"
          visibility="visible"
          opacity={1}
        />
        {!isCollapsed && (
          <Text display="inline-block" visibility="visible" opacity={1}>
            Logout
          </Text>
        )}
      </Flex>
    </Tooltip>
  );
} 