'use client';

import React from 'react';
import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { AuthStateProvider } from '@/components/auth/AuthStateProvider';

// Extend the theme to include custom colors, fonts, etc
const theme = extendTheme({
  // Add your theme customizations here
  config: {
    initialColorMode: 'system',
    useSystemColorMode: true,
  },
  colors: {
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      // ... add more shades as needed
    },
  },
});

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps): JSX.Element {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <SupabaseAuthProvider>
            <AuthStateProvider>{children}</AuthStateProvider>
          </SupabaseAuthProvider>
        </QueryClientProvider>
      </ChakraProvider>
    </CacheProvider>
  );
}
