'use client';

import { Box, Container, VStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { AuthHeader } from './AuthHeader';
import { AuthFooter } from './AuthFooter';

interface AuthContainerProps {
  children: ReactNode;
  maxWidth?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function AuthContainer({
  children,
  maxWidth = "container.sm",
  showHeader = true,
  showFooter = true,
}: AuthContainerProps): JSX.Element {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      {showHeader && <AuthHeader />}
      <Container
        as="main"
        maxW={maxWidth}
        flex="1"
        display="flex"
        flexDirection="column"
        py={8}
      >
        <VStack spacing={8} flex="1" justify="center">
          {children}
        </VStack>
      </Container>
      {showFooter && <AuthFooter />}
    </Box>
  );
}
