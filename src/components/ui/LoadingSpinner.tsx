import type { SpinnerProps} from '@chakra-ui/react';
import { Spinner, Center } from '@chakra-ui/react';

export function LoadingSpinner(props: SpinnerProps): JSX.Element {
  return (
    <Center p={4}>
      <Spinner 
        size="xl"
        color="primary"
        thickness="4px"
        speed="0.65s"
        {...props}
      />
    </Center>
  );
} 