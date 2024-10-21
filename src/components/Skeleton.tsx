import React from 'react';
import { Box } from '@chakra-ui/react';
import { Skeleton as ChakraSkeleton } from '@chakra-ui/skeleton';

interface SkeletonProps {
  height?: string | number;
  width?: string | number;
  isCircle?: boolean;
}

export function Skeleton({ height = '20px', width = '100%', isCircle = false }: SkeletonProps) {
  if (isCircle) {
    return <ChakraSkeleton height={height} width={height} borderRadius="50%" />;
  }

  return (
    <Box padding="6" boxShadow="lg" bg="white" width={width}>
      <ChakraSkeleton height={height} />
    </Box>
  );
}
