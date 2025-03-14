'use client';

import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function AuthError(): JSX.Element {
  const router = useRouter();

  return (
    <Box textAlign="center" py={10} px={6}>
      <Heading
        display="inline-block"
        as="h2"
        size="2xl"
        bgGradient="linear(to-r, red.400, red.600)"
        backgroundClip="text"
      >
        Authentication Error
      </Heading>
      <Text fontSize="18px" mt={3} mb={2}>
        There was an error during authentication
      </Text>
      <Text color={'gray.500'} mb={6}>
        Please try signing in again
      </Text>

      <Button
        colorScheme="blue"
        bgGradient="linear(to-r, blue.400, blue.500, blue.600)"
        color="white"
        variant="solid"
        onClick={() => router.push('/auth/signin')}
      >
        Go to Sign In
      </Button>
    </Box>
  );
}
