import { Spinner, SpinnerProps, Center } from '@chakra-ui/react';

export function LoadingSpinner(props: SpinnerProps) {
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