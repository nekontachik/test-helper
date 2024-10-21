declare module '@chakra-ui/react' {
  import { ComponentWithAs, ChakraComponent } from '@chakra-ui/react';

  export const Box: ChakraComponent<'div'>;
  export const Flex: ChakraComponent<'div'>;
  export const VStack: ChakraComponent<'div'>;
  export const Heading: ChakraComponent<'h2'>;
  export const Text: ChakraComponent<'p'>;
  export const Spinner: ChakraComponent<'div'>;
  export const Table: ChakraComponent<'table'>;
  export const Thead: ChakraComponent<'thead'>;
  export const Tbody: ChakraComponent<'tbody'>;
  export const Tr: ChakraComponent<'tr'>;
  export const Th: ChakraComponent<'th'>;
  export const Td: ChakraComponent<'td'>;
  export const Button: ChakraComponent<'button'>;
  export const ChakraProvider: React.FC<{
    theme?: any;
    children: React.ReactNode;
  }>;
  export const Badge: ChakraComponent<'span'>;
  export const FormControl: ChakraComponent<'div'>;
  export const FormLabel: ChakraComponent<'label'>;
  export const Input: ChakraComponent<'input'>;
  export const Select: ChakraComponent<'select'>;
  export const Textarea: ChakraComponent<'textarea'>;
  export const FormErrorMessage: ChakraComponent<'div'>;
  // Add other components as needed
}
