'use client';

import { useEffect, useState } from 'react';
import {
  VStack,
  Text,
  Button,
  useToast,
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { AuthCard } from './AuthCard';

interface AuthVerificationProps {
  token: string;
}

export function AuthVerification({ token }: AuthVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          throw new Error('Verification failed');
        }

        setIsSuccess(true);
        toast({
          title: 'Email Verified',
          description: 'Your email has been successfully verified.',
          status: 'success',
          duration: 5000,
        });

        // Redirect to signin after 3 seconds
        setTimeout(() => {
          router.push('/auth/signin');
        }, 3000);
      } catch (error) {
        toast({
          title: 'Verification Failed',
          description: 'Failed to verify your email. Please try again.',
          status: 'error',
          duration: 5000,
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, router, toast]);

  return (
    <AuthCard title="Email Verification">
      <VStack spacing={6} width="100%">
        {isVerifying ? (
          <Box width="100%">
            <Text mb={4}>Verifying your email...</Text>
            <Progress size="xs" isIndeterminate />
          </Box>
        ) : isSuccess ? (
          <Alert
            status="success"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="200px"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Email Verified!
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              Your email has been successfully verified. You will be redirected to
              the login page shortly.
            </AlertDescription>
          </Alert>
        ) : (
          <VStack spacing={4}>
            <Alert
              status="error"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              height="200px"
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                Verification Failed
              </AlertTitle>
              <AlertDescription maxWidth="sm">
                We couldn't verify your email. The link may have expired or is
                invalid.
              </AlertDescription>
            </Alert>
            <Button
              colorScheme="blue"
              width="full"
              onClick={() => router.push('/auth/signup')}
            >
              Back to Sign Up
            </Button>
          </VStack>
        )}
      </VStack>
    </AuthCard>
  );
}
