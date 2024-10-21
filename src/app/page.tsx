import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Home() {
  return (
    <ErrorBoundary>
      <Box>
        <Heading>Welcome to Test Management Application</Heading>
        {/* Add more content here */}
      </Box>
    </ErrorBoundary>
  );
}
