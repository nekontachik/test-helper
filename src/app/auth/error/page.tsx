'use client';

import { useSearchParams } from 'next/navigation';
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

const getErrorMessage = (error: string | null): string => {
  switch (error) {
    case 'Configuration':
      return 'There is a problem with the server configuration. Please try again later.';
    case 'AccessDenied':
      return 'You do not have permission to access this resource.';
    case 'Verification':
      return 'The verification link may have expired or already been used.';
    case 'OAuthSignin':
      return 'Error occurred while signing in with the provider.';
    case 'OAuthCallback':
      return 'Error occurred while processing the sign in callback.';
    case 'OAuthCreateAccount':
      return 'Could not create user account with the provider.';
    case 'EmailCreateAccount':
      return 'Could not create user account with email.';
    case 'Callback':
      return 'Error occurred during the callback process.';
    case 'InvalidCredentials':
      return 'Invalid email or password.';
    case 'default':
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');
  const router = useRouter();

  return (
    <Box maxW="md" mx="auto" mt={8} p={6}>
      <VStack spacing={6} align="stretch">
        <Heading textAlign="center" color="red.500">
          Authentication Error
        </Heading>

        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {getErrorMessage(error)}
            </AlertDescription>
          </Box>
        </Alert>

        <VStack spacing={4}>
          <Button
            width="full"
            onClick={() => router.push('/auth/signin')}
            colorScheme="blue"
          >
            Try Again
          </Button>
          <Button
            width="full"
            variant="ghost"
            onClick={() => router.push('/')}
          >
            Return to Home
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}
