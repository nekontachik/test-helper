'use client';

import { ChakraProvider, createLocalStorageManager } from '@chakra-ui/react';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { NoFlash } from '@/components/NoFlash';
import { GlobalErrorBoundary } from '@/components/error-boundary/GlobalErrorBoundary';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import theme from '@/lib/theme';
import type { ReactNode } from 'react';

// Create a custom storage manager to avoid hydration mismatch
const colorModeManager = createLocalStorageManager('test-helper-color-mode');

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps): JSX.Element {
  return (
    <ChakraProvider theme={theme} resetCSS={false} colorModeManager={colorModeManager}>
      <NoFlash />
      <ThemeProvider>
        <SupabaseAuthProvider>
          <GlobalErrorBoundary>
            {children}
          </GlobalErrorBoundary>
        </SupabaseAuthProvider>
      </ThemeProvider>
    </ChakraProvider>
  );
} 