import { Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton } from '@chakra-ui/react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onClose?: () => void;
  status?: 'error' | 'warning' | 'info' | 'success';
}

export function ErrorMessage({ 
  title, 
  message, 
  onClose, 
  status = 'error' 
}: ErrorMessageProps): JSX.Element {
  return (
    <Alert status={status} variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" borderRadius="md" py={4} mb={4}>
      <AlertIcon boxSize="24px" mr={0} />
      {title && <AlertTitle mt={4} mb={1} fontSize="lg">{title}</AlertTitle>}
      <AlertDescription maxWidth="sm">
        {message}
      </AlertDescription>
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