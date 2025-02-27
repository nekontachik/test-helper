'use client';

import { SignInForm } from '@/components/auth/SignInForm';
import { Box, Container, Heading, Text } from '@chakra-ui/react';

export default function SignInPage(): JSX.Element {
  return (
    <Container maxW="container.md" py={10}>
      <Box textAlign="center" mb={8}>
        <Heading as="h1" size="xl" mb={2}>
          Welcome Back
        </Heading>
        <Text color="gray.600">
          Sign in to your account to continue
        </Text>
      </Box>
      
      <SignInForm />
    </Container>
  );
}
