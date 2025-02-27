'use client';

import { useEffect } from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): JSX.Element {
  useEffect(() => {
    console.error('Auth error:', error);
  }, [error]);

  const router = useRouter();

  return (
    <Box textAlign="center" py={10} px={6}>
      <Heading display="inline-block" size="xl">
        Authentication Error
      </Heading>
      <Text mt={3} mb={2}>
        {error.message}
      </Text>
      <Button
        colorScheme="blue"
        onClick={() => router.push('/auth/signin')}
        mr={3}
      >
        Back to Sign In
      </Button>
      <Button
        variant="ghost"
        onClick={() => reset()}
      >
        Try again
      </Button>
    </Box>
  );
} 