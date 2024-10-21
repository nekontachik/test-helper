import { ComponentStyleConfig } from '@chakra-ui/react';

declare module '@chakra-ui/react' {
  export const extendTheme: any;
  export type ThemeConfig = any;
  export interface CustomTheme {
    components: {
      [componentName: string]: ComponentStyleConfig;
    };
  }
  // Add other Chakra UI types as needed
}
