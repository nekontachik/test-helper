'use client';

import type {
  AlertProps} from '@chakra-ui/react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box
} from '@chakra-ui/react';

interface AuthMessageProps extends Omit<AlertProps, 'title'> {
  title: string;
  message: string;
  showIcon?: boolean;
}

export function AuthMessage({ 
  status = 'info',
  title,
  message,
  showIcon = true,
  ...props
}: AuthMessageProps): JSX.Element {
  return (
    <Alert
      status={status}
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      borderRadius="md"
      p={6}
      {...props}
    >
      <Box>
        {showIcon && <AlertIcon boxSize="40px" mr={0} mb={4} />}
        <AlertTitle mt={showIcon ? 4 : 0} mb={2} fontSize="lg">
          {title}
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          {message}
        </AlertDescription>
      </Box>
    </Alert>
  );
}
