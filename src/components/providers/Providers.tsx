'use client';

import { ChakraProvider, createLocalStorageManager } from '@chakra-ui/react';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { NoFlash } from '@/components/NoFlash';
import { GlobalErrorBoundary } from '@/components/error-boundary/GlobalErrorBoundary';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import theme from '@/lib/theme';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

// Create a custom storage manager to avoid hydration mismatch
const colorModeManager = createLocalStorageManager('test-helper-color-mode');

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps): JSX.Element {
  // Ensure proper initialization
  useEffect(() => {
    // Add js-enabled class to document
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('js-enabled');
      
      // Force visibility to prevent FOUC
      document.documentElement.style.visibility = 'visible';
      document.documentElement.style.opacity = '1';
      
      // Set initialization flag
      if (typeof window !== 'undefined') {
        window.__THEME_INITIALIZED__ = true;
      }
    }
  }, []);
  
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