import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';

const DebugPage: React.FC = () => {
  const router = useRouter();

  return (
    <Box p={4}>
      <Heading as="h1" mb={4}>
        Debug Information
      </Heading>
      <VStack align="start" spacing={4}>
        <Box>
          <Heading as="h2" size="md">
            Router Information
          </Heading>
          <Text>Path: {router.pathname}</Text>
          <Text>Query: {JSON.stringify(router.query)}</Text>
        </Box>
        {/* Add more debug information sections as needed */}
      </VStack>
    </Box>
  );
};

export default DebugPage;
