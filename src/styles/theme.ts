'use client';

import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'blue',
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'white',
      },
    },
  },
});

export default theme;