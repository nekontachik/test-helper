import * as React from 'react';
import { Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton, Box } from '@chakra-ui/react';
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  title?: string;
  message?: string;
  error?: Error;
  onClose?: () => void;
  status?: 'error' | 'warning' | 'info' | 'success';
  variant?: 'subtle' | 'solid' | 'left-accent' | 'top-accent';
  centered?: boolean;
  className?: string;
}

export function ErrorMessage({ 
  title = 'Error', 
  message,
  error,
  onClose, 
  status = 'error',
  variant = 'subtle',
  centered = false,
  className,
  ...props
}: ErrorMessageProps): JSX.Element {
  // Determine the message to display
  const displayMessage = message || error?.message || 'An error occurred';
  
  return (
    <Alert 
      status={status} 
      variant={variant} 
      flexDirection={centered ? "column" : "row"} 
      alignItems={centered ? "center" : "flex-start"} 
      justifyContent={centered ? "center" : "flex-start"} 
      textAlign={centered ? "center" : "left"} 
      borderRadius="md" 
      py={4} 
      mb={4}
      className={cn(className)}
      {...props}
    >
      <AlertIcon boxSize={centered ? "24px" : "20px"} mr={centered ? 0 : 2} />
      <Box>
        {title && <AlertTitle mt={centered ? 4 : 0} mb={1} fontSize={centered ? "lg" : "md"}>{title}</AlertTitle>}
        <AlertDescription maxWidth={centered ? "sm" : "full"}>
          {displayMessage}
        </AlertDescription>
      </Box>
      {onClose && (
        <CloseButton
          position="absolute"
          right="8px"
          top="8px"
          onClick={onClose}
        />
      )}
    </Alert>
  );
} 