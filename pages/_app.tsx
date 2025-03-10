import type { AppProps } from 'next/app';
import { SessionProvider } from "next-auth/react";
import { ChakraProvider } from '@chakra-ui/react';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps): JSX.Element {
  return (
    <SessionProvider session={session}>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </SessionProvider>
  );
}

export default MyApp;
