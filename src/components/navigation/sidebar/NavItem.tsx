'use client';

import React from 'react';
import { 
  Flex, 
  Text, 
  Icon, 
  useColorModeValue,
  Tooltip
} from '@chakra-ui/react';
import Link from 'next/link';
import type { IconType } from 'react-icons';
import { useTheme } from '@/components/providers/ThemeProvider';

interface NavItemProps {
  icon: IconType;
  children: string;
  href: string;
  isActive?: boolean;
  isCollapsed?: boolean;
}

export function NavItem({ icon, children, href, isActive, isCollapsed }: NavItemProps): JSX.Element {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const defaultActiveBg = useColorModeValue('gray.100', 'gray.700');
  const defaultHoverBg = useColorModeValue('gray.100', 'gray.700');
  const defaultActiveColor = useColorModeValue('blue.600', 'blue.300');
  
  // Determine colors based on theme
  const activeBg = isDarkMode ? '#334155' : defaultActiveBg;
  const hoverBg = isDarkMode ? '#334155' : defaultHoverBg;
  const activeColor = isDarkMode ? '#38bdf8' : defaultActiveColor;
  const textColor = isDarkMode ? '#f8fafc' : 'inherit';
  
  return (
    <Tooltip label={children} placement="right" hasArrow openDelay={500} isDisabled={!isCollapsed}>
      <Link href={href} passHref style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
        <Flex
          align="center"
          p="4"
          mx="4"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          bg={isActive ? activeBg : 'transparent'}
          color={isActive ? activeColor : textColor}
          _hover={{
            bg: hoverBg,
            color: activeColor,
          }}
          borderWidth={isActive ? (isDarkMode ? '2px' : '1px') : (isDarkMode ? '1px' : '0')}
          borderColor={isActive ? (isDarkMode ? '#38bdf8' : '#666666') : (isDarkMode ? '#475569' : 'transparent')}
          boxShadow={isActive ? (isDarkMode ? '0 0 5px rgba(56, 189, 248, 0.5)' : '0 1px 3px rgba(0, 0, 0, 0.1)') : 'none'}
          className={isActive ? 'active-nav-item' : 'nav-item'}
        >
          <Icon
            mr={isCollapsed ? 0 : 4}
            fontSize="20"
            as={icon}
            color={isActive ? activeColor : textColor}
            _groupHover={{ color: activeColor }}
            display="inline-block"
            visibility="visible"
            opacity={1}
          />
          {!isCollapsed && (
            <Text display="inline-block" visibility="visible" opacity={1}>
              {children}
            </Text>
          )}
        </Flex>
      </Link>
    </Tooltip>
  );
} 