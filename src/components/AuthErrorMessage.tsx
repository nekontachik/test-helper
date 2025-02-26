'use client';

import { Alert, AlertIcon, AlertTitle, AlertDescription, Box } from '@chakra-ui/react';

interface AuthErrorMessageProps {
  title?: string;
  message: string;
  showIcon?: boolean;
}

export function AuthErrorMessage({ 
  title = 'Error', 
  message,
  showIcon = true
}: AuthErrorMessageProps): JSX.Element {
  return (
    <Alert
      status="error"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      borderRadius="md"
      p={6}
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
