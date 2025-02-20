'use client';

import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useEffect } from 'react';
import logger from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Error boundary caught error:', error);
  }, [error]);

  return (
    <Box textAlign="center" py={10} px={6}>
      <Heading
        display="inline-block"
        as="h2"
        size="2xl"
        bgGradient="linear(to-r, red.400, red.600)"
        backgroundClip="text"
      >
        Something went wrong!
      </Heading>
      <Text color={'gray.500'} mb={6}>
        {error.message}
      </Text>

      <Button
        colorScheme="red"
        bgGradient="linear(to-r, red.400, red.500, red.600)"
        color="white"
        variant="solid"
        onClick={reset}
      >
        Try again
      </Button>
    </Box>
  );
} 