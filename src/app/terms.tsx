import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { MainLayout } from '../components/MainLayout';

const TermsOfService: React.FC = () => {
  return (
    <MainLayout>
      <Box maxW="container.md" mx="auto">
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="2xl">
            Terms of Service
          </Heading>
          <Text>
            By using our Test Management Application, you agree to comply with
            and be bound by the following terms and conditions of use.
          </Text>
          {/* Add more sections as needed */}
        </VStack>
      </Box>
    </MainLayout>
  );
};

export default TermsOfService;
