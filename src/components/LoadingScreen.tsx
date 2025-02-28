'use client';

import React from 'react';
import { Center, Spinner, Text, VStack } from '@chakra-ui/react';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps): JSX.Element {
  return (
    <Center h="100vh" w="100%">
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
        <Text fontSize="lg" fontWeight="medium">
          {message}
        </Text>
      </VStack>
    </Center>
  );
} 