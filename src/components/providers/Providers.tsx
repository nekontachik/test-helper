'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { NoFlash } from '@/components/NoFlash';
import theme from '@/lib/theme';
import type { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps): JSX.Element {
  return (
    <ChakraProvider theme={theme} resetCSS={false}>
      <NoFlash />
      <SupabaseAuthProvider>
        {children}
      </SupabaseAuthProvider>
    </ChakraProvider>
  );
} 