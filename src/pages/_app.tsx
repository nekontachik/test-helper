import type { AppProps } from 'next/app';
import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider } from '@chakra-ui/react';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <ErrorBoundary>
      <CacheProvider>
        <ChakraProvider>
          <Component {...pageProps} />
        </ChakraProvider>
      </CacheProvider>
    </ErrorBoundary>
  );
} 