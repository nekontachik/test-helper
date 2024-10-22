import React from 'react';
import { Box, Heading, Text, Badge, VStack, Button, Flex } from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
import { useRouter } from 'next/navigation';
import { TestCase, TestCaseStatus, TestCasePriority } from '@/types';
import { TestCaseVersionHistory } from '@/components/TestCaseVersionHistory';
import { useRestoreTestCaseVersion } from '@/hooks/useTestCase';
import ErrorBoundary from '@/components/ErrorBoundary';

interface TestCaseDetailsProps {
  testCase: TestCase;
  projectId: string;
}

export function TestCaseDetails({ testCase, projectId }: TestCaseDetailsProps) {
  const router = useRouter();
  const toast = useToast();
  const restoreVersion = useRestoreTestCaseVersion(projectId, testCase.id);

  const handleEdit = () => {
    router.push(`/projects/${projectId}/test-cases/${testCase.id}/edit`);
  };

  const handleVersionRestore = async (versionNumber: number) => {
    try {
      await restoreVersion.mutateAsync(versionNumber);
      toast({
        title: 'Version restored',
        description: `Successfully restored version ${versionNumber}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error restoring version',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <ErrorBoundary>
      <Box borderWidth="1px" borderRadius="lg" p={6} boxShadow="md">
        <VStack align="start" spacing={4}>
          <Heading size="lg">{testCase.title}</Heading>
          <Flex>
            <Badge colorScheme={testCase.status === TestCaseStatus.ACTIVE ? 'green' : 'red'} mr={2}>
              {testCase.status}
            </Badge>
            <Badge colorScheme={testCase.priority === TestCasePriority.HIGH ? 'red' : testCase.priority === TestCasePriority.MEDIUM ? 'yellow' : 'blue'}>
              {testCase.priority}
            </Badge>
          </Flex>
          <Text>{testCase.description}</Text>
          {testCase.steps && (
            <Box>
              <Heading size="md" mb={2}>Steps</Heading>
              <Text whiteSpace="pre-wrap">{testCase.steps}</Text>
            </Box>
          )}
          <Box>
            <Heading size="md" mb={2}>Expected Result</Heading>
            <Text>{testCase.expectedResult}</Text>
          </Box>
          {testCase.actualResult && (
            <Box>
              <Heading size="md" mb={2}>Actual Result</Heading>
              <Text>{testCase.actualResult}</Text>
            </Box>
          )}
          <Flex>
            <Button onClick={handleEdit} colorScheme="blue">Edit Test Case</Button>
          </Flex>
          <TestCaseVersionHistory 
            projectId={projectId} 
            testCaseId={testCase.id} 
            onVersionRestore={handleVersionRestore}
          />
        </VStack>
      </Box>
    </ErrorBoundary>
  );
}
