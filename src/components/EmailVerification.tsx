'use client';

import { useState } from 'react';
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
} from '@chakra-ui/react';
import { AuthCard } from './AuthCard';

interface EmailVerificationProps {
  email: string;
}

export function EmailVerification({ email }: EmailVerificationProps) {
  const [isResending, setIsResending] = useState(false);
  const toast = useToast();

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend verification email');
      }

      toast({
        title: 'Verification Email Sent',
        description: 'Please check your email for the verification link.',
        status: 'success',
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend verification email. Please try again.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthCard title="Verify Your Email">
      <VStack spacing={6} width="100%">
        <Alert
          status="info"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Verification Required
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            We've sent a verification link to {email}. Please check your email and
            click the link to verify your account.
          </AlertDescription>
        </Alert>

        <Box width="100%">
          <Text fontSize="sm" color="gray.600" mb={4}>
            Didn't receive the email? Check your spam folder or click below to
            resend.
          </Text>
          <Button
            colorScheme="blue"
            width="full"
            onClick={handleResendVerification}
            isLoading={isResending}
          >
            Resend Verification Email
          </Button>
        </Box>
      </VStack>
    </AuthCard>
  );
}
