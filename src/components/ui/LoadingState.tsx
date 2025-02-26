import { Box, Spinner, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps): JSX.Element {
  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      textAlign="center"
      py={10}
    >
      <VStack spacing={4}>
        <Spinner
          size="xl"
          thickness="4px"
          speed="0.65s"
          color="blue.500"
        />
        <Text color="gray.600">{message}</Text>
      </VStack>
    </MotionBox>
  );
} 