'use client';

import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Unauthorized(): JSX.Element {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <Box textAlign="center" py={10} px={6}>
      <Heading
        display="inline-block"
        as="h2"
        size="2xl"
        bgGradient="linear(to-r, red.400, red.600)"
        backgroundClip="text"
      >
        Access Denied
      </Heading>
      <Text fontSize="18px" mt={3} mb={2}>
        You don&apos;t have permission to access this page
      </Text>
      <Text color={'gray.500'} mb={6}>
        Current role: {user?.role ?? 'Not authenticated'}
      </Text>

      <Button
        colorScheme="blue"
        bgGradient="linear(to-r, blue.400, blue.500, blue.600)"
        color="white"
        variant="solid"
        onClick={() => router.push('/')}
      >
        Go to Home
      </Button>
    </Box>
  );
}
