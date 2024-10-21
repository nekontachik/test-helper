'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  Spinner,
  Textarea,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { Radio, RadioGroup } from '@chakra-ui/radio';
import { useToast } from '@chakra-ui/toast';
import { useTestRun, useUpdateTestRun } from '@/hooks/useTestRuns';
import { TestCaseResultStatus, TestRunStatus, TestCase } from '@/types';

export default function ExecuteTestRunPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const testRunId = params?.testRunId as string;
  const router = useRouter();
  const toast = useToast();
  const { data: testRun, isLoading, error } = useTestRun(projectId, testRunId);
  const updateTestRun = useUpdateTestRun(projectId);
  const [results, setResults] = useState<
    Record<string, { status: TestCaseResultStatus; notes: string }>
  >({});

  if (isLoading) {
    return <Spinner size="xl" />;
  }

  if (error) {
    return <Text color="red.500">Error: Unable to load test run.</Text>;
  }

  if (!testRun) {
    return <Text>Test run not found.</Text>;
  }

  const handleResultChange = (testCaseId: string, status: TestCaseResultStatus) => {
    setResults((prev) => ({
      ...prev,
      [testCaseId]: { ...prev[testCaseId], status },
    }));
  };

  const handleNotesChange = (testCaseId: string, notes: string) => {
    setResults((prev) => ({
      ...prev,
      [testCaseId]: { ...prev[testCaseId], notes },
    }));
  };

  const handleSubmit = async () => {
    try {
      await updateTestRun.mutateAsync({
        testRunId,
        status: TestRunStatus.COMPLETED,
        testCaseResults: Object.entries(results).map(
          ([testCaseId, result]) => ({
            testCaseId,
            status: result.status,
            notes: result.notes,
          })
        ),
      });
      toast({
        title: 'Test run completed.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push(`/projects/${projectId}/test-runs/${testRunId}`);
    } catch (error) {
      toast({
        title: 'Error completing test run.',
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4}>
      <Heading mb={6}>Execute Test Run: {testRun.name}</Heading>
      <VStack spacing={6} align="stretch">
        {testRun.testCases?.map((testCase: TestCase) => (
          <Box key={testCase.id} p={4} borderWidth={1} borderRadius="md">
            <Heading size="md" mb={2}>
              {testCase.title}
            </Heading>
            <Text mb={2}>
              <strong>Description:</strong> {testCase.description}
            </Text>
            <FormControl as="fieldset">
              <FormLabel as="legend">Result</FormLabel>
              <RadioGroup
                onChange={(value) =>
                  handleResultChange(testCase.id, value as TestCaseResultStatus)
                }
                value={results[testCase.id]?.status}
              >
                <VStack align="start">
                  <Radio value={TestCaseResultStatus.PASSED}>Passed</Radio>
                  <Radio value={TestCaseResultStatus.FAILED}>Failed</Radio>
                  <Radio value={TestCaseResultStatus.SKIPPED}>Skipped</Radio>
                </VStack>
              </RadioGroup>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Notes</FormLabel>
              <Textarea
                value={results[testCase.id]?.notes || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleNotesChange(testCase.id, e.target.value)
                }
                placeholder="Add any notes or observations here"
              />
            </FormControl>
          </Box>
        ))}
        <Button
          onClick={handleSubmit}
          colorScheme="blue"
          isLoading={updateTestRun.isLoading}
        >
          Complete Test Run
        </Button>
      </VStack>
    </Box>
  );
}
