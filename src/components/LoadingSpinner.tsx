import React from 'react';
import { Spinner, Flex } from '@chakra-ui/react';

export const LoadingSpinner: React.FC = () => (
  <Flex justify="center" align="center" height="100%">
    <Spinner size="xl" color="blue.500" />
  </Flex>
);
