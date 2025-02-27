import React from 'react';
import { Box, Text } from '@chakra-ui/react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps): JSX.Element => {
  return (
    <Box bg="red.100" color="red.700" p={3} borderRadius="md">
      <Text>{message}</Text>
    </Box>
  );
}
