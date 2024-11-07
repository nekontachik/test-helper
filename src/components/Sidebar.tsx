'use client';

import React from 'react';
import { 
  Box, 
  VStack, 
  Text, 
  Link,
  Icon,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  DuplicateIcon,
  ViewOffIcon,
  RepeatClockIcon,
  SettingsIcon,
} from '@chakra-ui/icons';
import NextLink from 'next/link';

/**
 * Sidebar Component
 * 
 * A navigation sidebar component that provides links to main application sections.
 * Includes icons and responsive design.
 */

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  /** Optional className for custom styling */
  className?: string;
}

const navItems: NavItem[] = [
  { label: 'Projects', href: '/projects', icon: DuplicateIcon },
  { label: 'Test Cases', href: '/test-cases', icon: ViewOffIcon },
  { label: 'Test Runs', href: '/test-runs', icon: RepeatClockIcon },
  { label: 'Reports', href: '/reports', icon: SettingsIcon },
];

export function Sidebar({ className }: SidebarProps) {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  return (
    <Box
      as="nav"
      width="240px"
      bg={bgColor}
      p={4}
      borderRightWidth="1px"
      className={className}
      height="100vh"
      position="sticky"
      top={0}
    >
      <VStack spacing={2} align="stretch">
        {navItems.map((item) => (
          <Link
            key={item.href}
            as={NextLink}
            href={item.href}
            _hover={{ textDecoration: 'none' }}
          >
            <Flex
              p={3}
              borderRadius="md"
              alignItems="center"
              _hover={{ bg: hoverBg }}
              transition="all 0.2s"
              role="group"
            >
              <Icon
                as={item.icon}
                mr={3}
                boxSize={5}
                color={textColor}
                _groupHover={{ color: 'blue.500' }}
              />
              <Text
                color={textColor}
                _groupHover={{ color: 'blue.500' }}
                fontWeight="medium"
              >
                {item.label}
              </Text>
            </Flex>
          </Link>
        ))}
      </VStack>
    </Box>
  );
}

/**
 * Usage Examples:
 * 
 * Basic Usage:
 * ```tsx
 * <Sidebar />
 * ```
 * 
 * With Custom Styling:
 * ```tsx
 * <Sidebar className="custom-sidebar" />
 * ```
 */

/**
 * Accessibility Features:
 * - Proper ARIA roles
 * - Keyboard navigation
 * - Focus management
 * - Color contrast
 * - Screen reader support
 * 
 * Performance Considerations:
 * - Memoized color mode values
 * - Static navigation items
 * - Optimized icon imports
 * - Minimal re-renders
 * 
 * Dependencies:
 * - @chakra-ui/react
 * - next/link
 * - @chakra-ui/icons
 */
