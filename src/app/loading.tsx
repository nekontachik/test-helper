import { Box, Spinner, Text } from '@chakra-ui/react';

export default function Loading(): JSX.Element {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      height="100vh"
    >
      <Spinner size="xl" mb={4} />
      <Text>Loading...</Text>
    </Box>
  );
} 