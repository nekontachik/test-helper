'use client';

import { Box, SimpleGrid, Skeleton } from '@chakra-ui/react';

export const LoadingState = (): JSX.Element => {
  return (
    <Box p={8}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} height="150px" borderRadius="md" />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default LoadingState; 