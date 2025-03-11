'use client';

import React from 'react';
import {
  Stack,
  Box,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useTheme } from '@/components/providers/ThemeProvider';

interface NavItem {
  label: string;
  href?: string;
}

export function MobileNavItem({ label, href }: NavItem): JSX.Element {
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
        px={3}
        display="flex"
        color={textColor}
        fontWeight={isDarkMode ? 'bold' : 'medium'}
        borderWidth={isDarkMode ? '1px' : '0'}
        borderColor={isDarkMode ? '#ffffff' : 'transparent'}
      >
        <Text
          fontWeight={600}
          color={textColor}
        >
          {label}
        </Text>
      </Box>
    </Stack>
  );
} 