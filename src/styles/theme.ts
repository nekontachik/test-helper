import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
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
        bg: 'gray.50',
      },
    },
  },
});
