'use client';

import { useEffect, useState } from 'react';
import { VStack, Text, Button, useToast } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { AuthCard } from './AuthCard';
import { AuthMessage } from './AuthMessage';

interface VerificationStatusProps {
  email: string;
}

export function VerificationStatus({ email }: VerificationStatusProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const response = await fetch('/api/auth/verification-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        setIsVerified(data.isVerified);
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to check verification status',
          status: 'error',
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkVerificationStatus();
  }, [email, toast]);

  const handleResendVerification = async () => {
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send verification email');
      }

      toast({
        title: 'Verification email sent',
        description: 'Please check your email for the verification link',
        status: 'success',
        duration: 5000,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to send verification email',
        status: 'error',
        duration: 5000,
      });
    }
  };

  if (isLoading) {
    return <Text>Checking verification status...</Text>;
  }

  return (
    <AuthCard title="Email Verification">
      {isVerified ? (
        <VStack spacing={4}>
          <AuthMessage
            status="success"
            title="Email Verified"
            message="Your email has been successfully verified."
          />
          <Button onClick={() => router.push('/auth/signin')}>
            Proceed to Sign In
          </Button>
        </VStack>
      ) : (
        <VStack spacing={4}>
          <AuthMessage
            status="warning"
            title="Email Not Verified"
            message="Please verify your email to continue."
          />
          <Text>
            We've sent a verification link to {email}. Please check your email and
            click the link to verify your account.
          </Text>
          <Button onClick={handleResendVerification}>
            Resend Verification Email
          </Button>
        </VStack>
      )}
    </AuthCard>
  );
}
