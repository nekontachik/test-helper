import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { MainLayout } from '../components/MainLayout';

const PrivacyPolicy: React.FC = () => {
  return (
    <MainLayout>
      <Box maxW="container.md" mx="auto">
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="2xl">
            Privacy Policy
          </Heading>
          <Text>
            This privacy policy outlines how we collect, use, and protect your
            personal information when you use our Testing Buddy.
          </Text>
          {/* Add more sections as needed */}
        </VStack>
      </Box>
    </MainLayout>
  );
};

export default PrivacyPolicy;
