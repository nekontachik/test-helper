'use client';

import { useEffect } from 'react';
import { useColorMode } from '@chakra-ui/react';
import { useTheme } from '@/components/providers/ThemeProvider';

/**
 * Hook to synchronize Chakra UI's color mode with our custom theme
 * This helps ensure consistency between Chakra UI and Shadcn UI components
 */
export function useSynchronizedTheme(): void {
  const { colorMode, setColorMode } = useColorMode();
  const { theme } = useTheme();
  
  // Synchronize themes
  useEffect(() => {
    // Sync Chakra's color mode with our theme
    if (theme === 'light' && colorMode !== 'light') {
      setColorMode('light');
    } else if (theme === 'dark' && colorMode !== 'dark') {
      setColorMode('dark');
    }
  }, [theme, colorMode, setColorMode]);
}

/**
 * Utility function to get consistent class names between Chakra UI and Shadcn UI
 */
export function getConsistentClassNames(baseClasses: string, isDarkMode: boolean): string {
  if (isDarkMode) {
    return `${baseClasses} dark-mode`;
  }
  return baseClasses;
}

/**
 * Utility function to get consistent style props for Chakra UI components
 */
export function getChakraStyleProps(isDarkMode: boolean): Record<string, unknown> {
  if (isDarkMode) {
    return {
      bg: '#1e293b',
      color: '#f8fafc',
      borderColor: '#475569',
      _hover: {
        bg: '#334155',
      },
      _active: {
        bg: '#334155',
      },
      _focus: {
        boxShadow: '0 0 0 3px #38bdf8',
      }
    };
  }
  
  return {};
} 