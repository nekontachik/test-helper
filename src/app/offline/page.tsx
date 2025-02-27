import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function OfflinePage(): JSX.Element {
  const router = useRouter();

  return (
    <Box className="container mx-auto py-8 text-center">
      <Heading mb={4}>You&apos;re Offline</Heading>
      <Text mb={6}>
        It looks like you&apos;ve lost your internet connection. 
        Don&apos;t worry - any test results you&apos;ve recorded will be synced when you&apos;re back online.
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