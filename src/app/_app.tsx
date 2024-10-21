import React from 'react';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react';
import  apiClient  from '../lib/apiClient';
import Error from './_error';
import { useEffect } from 'react';

const queryClient = new QueryClient();

// Prefetch projects data
queryClient.prefetchQuery({
  queryKey: ['projects'],
  queryFn: () => apiClient.getProjects(),
});

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    // Add more environment variables here as needed
  }, []);

  if (pageProps.error) {
    return <Error statusCode={pageProps.error.statusCode} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
