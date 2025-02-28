import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';

export default function Custom500(): JSX.Element {
  const router = useRouter();
  
  return (
    <Box textAlign="center" py={10} px={6}>
      <Heading
        display="inline-block"
        as="h2"
        size="2xl"
        bgGradient="linear(to-r, red.400, red.600)"
        backgroundClip="text"
      >
        500
      </Heading>
      <Text fontSize="18px" mt={3} mb={2}>
        Internal Server Error
      </Text>
      <Text color={"gray.500"} mb={6}>
        Sorry, something went wrong on our server.
      </Text>

      <Button
        colorScheme="red"
        bgGradient="linear(to-r, red.400, red.500, red.600)"
        color="white"
        variant="solid"
        onClick={() => router.reload()}
        mr={3}
      >
        Try Again
      </Button>
      <Button
        colorScheme="blue"
        variant="outline"
        onClick={() => router.push('/')}
      >
        Go to Home
      </Button>
    </Box>
  );
} 