'use client';

import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import logger from '@/lib/utils/logger';

export default function NotFound(): JSX.Element {
  const router = useRouter();
  
  logger.info('Rendering NotFound page');

  return (
    <Box textAlign="center" py={10} px={6}>
      <Heading
        display="inline-block"
        as="h2"
        size="2xl"
        bgGradient="linear(to-r, red.400, red.600)"
        backgroundClip="text"
      >
        404
      </Heading>
      <Text fontSize="18px" mt={3} mb={2}>
        Page Not Found
      </Text>
      <Text color={'gray.500'} mb={6}>
        The page you&apos;re looking for does not seem to exist
      </Text>

      <Button
        colorScheme="red"
        bgGradient="linear(to-r, red.400, red.500, red.600)"
        color="white"
        variant="solid"
        onClick={() => router.push('/')}
      >
        Go to Home
      </Button>
    </Box>
  );
} 