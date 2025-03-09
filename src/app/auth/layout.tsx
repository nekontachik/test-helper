import { Container, Box } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Sign in or create an account',
};

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <Box minH="100vh" py={10} px={4} bg="gray.50">
      <Container maxW="lg">
        {children}
      </Container>
    </Box>
  );
} 