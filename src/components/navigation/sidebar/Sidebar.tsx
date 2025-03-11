'use client';

import React, { useEffect } from 'react';
import { 
  Box, 
  useColorModeValue,
} from '@chakra-ui/react';
import { useLayout } from '@/contexts/LayoutContext';
import { useTheme } from '@/components/providers/ThemeProvider';
import { NavItems } from './NavItems';
import { LogoutButton } from './LogoutButton';

export function Sidebar(): JSX.Element {
  const { isSidebarOpen } = useLayout();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const defaultBgColor = useColorModeValue('white', 'gray.800');
  const defaultBorderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Determine colors based on theme
  const bgColor = isDarkMode ? '#1e293b' : defaultBgColor;
  const borderColor = isDarkMode ? '#38bdf8' : defaultBorderColor;
  
  const isCollapsed = !isSidebarOpen;
  
  // Add or remove sidebar-collapsed class based on sidebar state
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isCollapsed) {
        document.body.classList.add('sidebar-collapsed');
      } else {
        document.body.classList.remove('sidebar-collapsed');
      }
    }
    
    // Cleanup function to remove class when component unmounts
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('sidebar-collapsed');
      }
    };
  }, [isCollapsed]);

  return (
    <Box
      as="aside"
      position="fixed"
      left={0}
      top="60px"
      bottom={0}
      width={isCollapsed ? '60px' : '240px'}
      bg={bgColor}
      borderRight="1px"
      borderRightColor={borderColor}
      transition="width 0.2s ease-in-out"
      overflowY="auto"
      className="sidebar"
    >
      <NavItems isCollapsed={isCollapsed} />
      <LogoutButton isCollapsed={isCollapsed} />
    </Box>
  );
} 