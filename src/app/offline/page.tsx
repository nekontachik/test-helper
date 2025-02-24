import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const router = useRouter();

  return (
    <Box className="container mx-auto py-8 text-center">
      <Heading mb={4}>You're Offline</Heading>
      <Text mb={6}>
        It looks like you've lost your internet connection. 
        Don't worry - any test results you've recorded will be synced when you're back online.
      </Text>
      <Button 
        onClick={() => router.refresh()}
        colorScheme="blue"
      >
        Try Again
      </Button>
    </Box>
  );
} 