import React from 'react';
import { Box, Skeleton as ChakraSkeleton } from '@chakra-ui/react';

interface SkeletonProps {
  height?: string | number;
  width?: string | number;
  isCircle?: boolean;
}

export function Skeleton({ height = '20px', width = '100%', isCircle = false }: SkeletonProps): JSX.Element {
  if (isCircle) {
    return <ChakraSkeleton height={height} width={height} borderRadius="50%" />;
  }

  return (
    <Box padding="6" boxShadow="lg" bg="white" width={width}>
      <ChakraSkeleton height={height} />
    </Box>
  );
}
