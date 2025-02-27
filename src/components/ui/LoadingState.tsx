import { Box, Spinner, Text, VStack } from '@chakra-ui/react';

interface LoadingStateProps {
  text?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  fullPage?: boolean;
}

export function LoadingState({ 
  text = 'Loading...', 
  size = 'md', 
  color = 'blue.500',
  fullPage = false 
}: LoadingStateProps): JSX.Element {
  const content = (
    <VStack spacing={4}>
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color={color}
        size={size}
      />
      {text && <Text color="gray.600">{text}</Text>}
    </VStack>
  );

  if (fullPage) {
    return (
      <Box 
        position="fixed" 
        top="0" 
        left="0" 
        right="0" 
        bottom="0" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="rgba(255, 255, 255, 0.8)"
        zIndex="modal"
      >
        {content}
      </Box>
    );
  }

  return (
    <Box py={8} display="flex" alignItems="center" justifyContent="center">
      {content}
    </Box>
  );
} 