import React from 'react';
import { Box, Text } from '@chakra-ui/react';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <Box bg="red.100" color="red.700" p={3} borderRadius="md">
      <Text>{message}</Text>
    </Box>
  );
}
