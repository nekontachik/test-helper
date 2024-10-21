import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    black: '#000000',
    white: '#FFFFFF',
  },
  styles: {
    global: {
      body: {
        bg: 'white',
        color: 'black',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        _hover: {
          bg: 'black',
          color: 'white',
        },
      },
      variants: {
        solid: {
          bg: 'black',
          color: 'white',
          _hover: {
            bg: 'white',
            color: 'black',
            border: '1px solid black',
          },
        },
        outline: {
          bg: 'white',
          color: 'black',
          border: '1px solid black',
          _hover: {
            bg: 'black',
            color: 'white',
          },
        },
      },
    },
    // Add more component styles as needed
  },
});

export default theme;
