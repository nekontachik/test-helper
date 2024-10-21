import React, { useState } from 'react';
import { Box, VStack, Heading, Text, Select, Textarea, Button } from '@chakra-ui/react';
import { TestRun, TestCase, TestCaseResult, TestCaseResultStatus } from '@/types';
import { useUpdateTestRun } from '@/hooks/useTestRuns';

interface ExecuteTestRunProps {
  testRun: TestRun;
  onComplete: () => void;
}

interface TestCaseResultInput {
  testCaseId: string;
  status: TestCaseResultStatus;
  notes: string;
  testRunId: string;
}

export const ExecuteTestRun = ({ testRun, onComplete }: ExecuteTestRunProps) => {
  const [results, setResults] = useState<Record<string, TestCaseResultInput>>({});
  const updateTestRun = useUpdateTestRun(testRun.projectId);

  const handleResultChange = (testCaseId: string, status: TestCaseResultStatus, notes: string) => {
    setResults(prev => ({
      ...prev,
      [testCaseId]: { testCaseId, status, notes, testRunId: testRun.id }
    }));
  };

  const handleSubmit = async () => {
    try {
      await updateTestRun.mutateAsync({
        testRunId: testRun.id,
        data: {
          status: 'COMPLETED',
          testCaseResults: Object.values(results),
        },
      });
      onComplete();
    } catch (error) {
      console.error('Error updating test run:', error);
    }
  };

  return (
    <Box>
      <Heading size="lg" mb={4}>Execute Test Run: {testRun.name}</Heading>
      <VStack spacing={4} align="stretch">
        {testRun.testCases?.map((testCase: TestCase) => (
          <Box key={testCase.id} p={4} borderWidth={1} borderRadius="md">
            <Text fontWeight="bold">{testCase.title}</Text>
            <Text>{testCase.description}</Text>
            <Select
              placeholder="Select result"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                handleResultChange(testCase.id, e.target.value as TestCaseResultStatus, results[testCase.id]?.notes || '')}
              value={results[testCase.id]?.status || ''}
            >
              <option value={TestCaseResultStatus.PASSED}>Passed</option>
              <option value={TestCaseResultStatus.FAILED}>Failed</option>
              <option value={TestCaseResultStatus.SKIPPED}>Skipped</option>
            </Select>
            <Textarea
              placeholder="Notes"
              value={results[testCase.id]?.notes || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                handleResultChange(testCase.id, results[testCase.id]?.status || TestCaseResultStatus.SKIPPED, e.target.value)}
              mt={2}
            />
          </Box>
        ))}
        <Button onClick={handleSubmit} colorScheme="blue" isLoading={updateTestRun.isLoading}>
          Complete Test Run
        </Button>
      </VStack>
    </Box>
  );
};
