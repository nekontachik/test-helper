'use client';

import { Box, Container, VStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { AuthNav } from './AuthNav';
import { AuthStatus } from './AuthStatus';

interface AuthLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  showStatus?: boolean;
  maxWidth?: string;
}

export function AuthLayout({ 
  children, 
  showNav = true,
  showStatus = true,
  maxWidth = "container.md"
}: AuthLayoutProps): JSX.Element {
  return (
    <Box minH="100vh" bg="gray.50">
      {showNav && (
        <Box 
          as="header" 
          bg="white" 
          borderBottom="1px" 
          borderColor="gray.200"
          py={4}
        >
          <Container maxW={maxWidth}>
            <AuthNav />
          </Container>
        </Box>
      )}
      
      {showStatus && (
        <Box bg="gray.100" py={2}>
          <Container maxW={maxWidth}>
            <AuthStatus />
          </Container>
        </Box>
      )}

      <Container 
        as="main" 
        maxW={maxWidth} 
        py={8}
      >
        <VStack spacing={8} align="stretch">
          {children}
        </VStack>
      </Container>
    </Box>
  );
}
