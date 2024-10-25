import { extendTheme, type ThemeConfig } from '@chakra-ui/react';
import { components } from './components';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  components,
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      },
    },
  },
});
