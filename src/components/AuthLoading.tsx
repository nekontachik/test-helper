'use client';

import { Center, Spinner, Text, VStack } from '@chakra-ui/react';

interface AuthLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function AuthLoading({ 
  message = 'Loading...', 
  size = 'xl' 
}: AuthLoadingProps) {
  return (
    <Center minH="200px">
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size={size}
        />
        <Text color="gray.600" fontSize="sm">
          {message}
        </Text>
      </VStack>
    </Center>
  );
}
