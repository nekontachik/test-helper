'use client';

import { ChakraProvider, ColorModeScript, Box } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import theme from '@/lib/theme';
import { logger } from '@/lib/utils/clientLogger';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { PWAInit } from '@/components/PWAInit';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { PWAInstallPrompt } from '@/components/common/PWAInstallPrompt';
import { AuthProvider } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  logger.debug('Rendering RootLayout');

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body suppressHydrationWarning>
        <SessionProvider>
          <AuthProvider>
            <ChakraProvider theme={theme}>
              <Box minH="100vh" bg="gray.50">
                <ColorModeScript initialColorMode={theme.config.initialColorMode} />
                {mounted && <PWAInit />}
                <NotificationProvider>
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                </NotificationProvider>
                {mounted && <PWAInstallPrompt />}
              </Box>
            </ChakraProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
