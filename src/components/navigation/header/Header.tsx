'use client';

import React from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Stack,
  Collapse,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
} from '@chakra-ui/icons';
import { useTheme } from '@/components/providers/ThemeProvider';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ProfileMenu } from './ProfileMenu';
import { MobileNav } from './MobileNav';

export function Header(): JSX.Element {
  const { isOpen, onToggle } = useDisclosure();
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

  return (
    <Box className={isDarkMode ? 'dark-mode' : ''} as="header" width="100%">
      <Flex
        bg={bgColor}
        color={textColor}
        minH={'60px'}
        height={'60px'}
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
        width="100%"
        zIndex={1000}
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
          align="center"
          width="auto"
          ml="auto"
        >
          <ThemeToggle />
          <ProfileMenu />
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
} 