'use client';

import { Suspense } from 'react';
import { Box, Spinner } from '@chakra-ui/react';

interface LazyLoadProps {
  children: React.ReactNode;
  height?: string | number;
  minHeight?: string | number;
}

export function LazyLoad({ children, height = 'auto', minHeight = '200px' }: LazyLoadProps): JSX.Element {
  return (
    <Suspense
      fallback={
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height={height}
          minHeight={minHeight}
        >
          <Spinner size="xl" />
        </Box>
      }
    >
      {children}
    </Suspense>
  );
} 