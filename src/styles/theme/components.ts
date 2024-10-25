import { defineStyleConfig } from '@chakra-ui/react';

export const components = {
  Button: defineStyleConfig({
    defaultProps: {
      colorScheme: 'blue',
    },
  }),
  Input: defineStyleConfig({
    defaultProps: {
      focusBorderColor: 'blue.500',
    },
  }),
  FormLabel: defineStyleConfig({
    baseStyle: {
      fontWeight: 'medium',
    },
  }),
};
