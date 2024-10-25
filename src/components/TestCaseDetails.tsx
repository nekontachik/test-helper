'use client';

import React, { useState } from 'react';
import { useTestCase, useTestCaseVersions } from '@/hooks/useTestCase';
import { Box, Heading, Text, Button, VStack, Flex } from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
import { EditTestCaseForm } from './EditTestCaseForm';
import TestCaseVersionComparison from './TestCaseVersionComparison';
import ErrorBoundary from './ErrorBoundary';
import { handleApiError, logError } from '@/lib/errorReporting';

interface TestCaseDetailsProps {
  projectId: string;
  testCaseId: string;
}

const TestCaseDetails: React.FC<TestCaseDetailsProps> = ({ projectId, testCaseId }) => {
  const { data: testCase, isLoading, error } = useTestCase(projectId, testCaseId);
  const { data: versions } = useTestCaseVersions(projectId, testCaseId);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const toast = useToast();

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  if (error) {
    return <Box>Error: {error.message}</Box>;
  }

  if (!testCase) {
    return <Box>Test case not found</Box>;
  }

  const currentVersion = versions?.find((v: any) => v.versionNumber === testCase.version);
  const selectedVersionData = selectedVersion ? versions?.find((v: any) => v.versionNumber === selectedVersion) : null;

  return (
    <ErrorBoundary>
      <Box>
        {currentVersion && selectedVersionData && (
          <TestCaseVersionComparison oldVersion={currentVersion} newVersion={selectedVersionData} />
        )}
        <VStack align="start" spacing={4}>
          <Heading as="h1" size="xl">
            {testCase?.title}
          </Heading>
          <Text>{testCase?.description}</Text>
          <Text>Status: {testCase?.status}</Text>
          <Text>Priority: {testCase?.priority}</Text>
          <Flex gap={4}>
            <Button onClick={() => console.log('Edit button clicked')}>Edit</Button>
            <Button onClick={() => console.log('Delete button clicked')} colorScheme="red">
              Delete
            </Button>
          </Flex>
        </VStack>
      </Box>
    </ErrorBoundary>
  );
};

export default TestCaseDetails;
