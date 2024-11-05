import type { ComponentStyleConfig } from './types';

export const components: Record<string, ComponentStyleConfig> = {
  Button: {
    defaultProps: {
      colorScheme: 'blue',
    },
  },
  Input: {
    defaultProps: {
      focusBorderColor: 'blue.500',
    },
  },
  FormLabel: {
    baseStyle: {
      fontWeight: 'medium',
    },
  },
};
