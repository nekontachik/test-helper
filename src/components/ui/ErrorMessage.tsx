import { Alert, AlertIcon, AlertTitle, AlertDescription, Box } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

interface ErrorMessageProps {
  title?: string;
  message: string;
}

export function ErrorMessage({ title = 'Error', message }: ErrorMessageProps): JSX.Element {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Box>
      </Alert>
    </MotionBox>
  );
} 