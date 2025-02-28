import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Spinner, Text } from '@chakra-ui/react';

export default function IndexPage(): JSX.Element {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the app router's home page
    router.push('/dashboard');
  }, [router]);
  
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      height="100vh"
    >
      <Spinner size="xl" mb={4} />
      <Text>Redirecting to dashboard...</Text>
    </Box>
  );
} 