'use client';

import React from 'react';
import {
  Stack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { MobileNavItem } from './MobileNavItem';

interface NavItem {
  label: string;
  href?: string;
}

const NAV_ITEMS: NavItem[] = [
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

export function MobileNav(): JSX.Element {
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
} 