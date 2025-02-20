import React from 'react';
import { Spinner, Text, VStack } from '@chakra-ui/react';

interface LoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Loading({ text = 'Loading...', size = 'md' }: LoadingProps) {
  return (
    <VStack spacing={4}>
      <Spinner size={size} />
      {text && <Text>{text}</Text>}
    </VStack>
  );
} 