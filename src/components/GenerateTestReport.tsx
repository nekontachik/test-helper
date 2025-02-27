import type { ChangeEvent } from 'react';
import React, { useState } from 'react';
import { Button, VStack, Heading, Text, Textarea } from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
import type { TestRun, TestReport, TestReportFormData } from '@/types';
import apiClient from '@/lib/apiClient';
import { ErrorMessage } from '@/components/ErrorMessage';
import { ApiError, ValidationError, DatabaseError } from '@/lib/errors';

interface GenerateTestReportProps {
  testRun: TestRun;
  onComplete: (report: TestReport) => void;
}

export default function GenerateTestReport({
  testRun,
  onComplete,
}: GenerateTestReportProps): JSX.Element {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleGenerateReport = async (): Promise<void> => {
    setIsGenerating(true);
    setError(null);
    try {
      const reportData: TestReportFormData = {
        name: `Test Run Report: ${testRun.name}`,
        description,
        runId: testRun.id,
        projectId: testRun.projectId,
      };
      const report = await apiClient.createTestReport(testRun.projectId, reportData);
      toast({
        title: 'Test report generated.',
        description: 'Your test report has been successfully generated.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onComplete(report);
    } catch (error) {
      let errorMessage = 'An unexpected error occurred';
      let errorTitle = 'Error generating test report';

      if (error instanceof ValidationError) {
        errorMessage = error.message;
        errorTitle = 'Validation Error';
      } else if (error instanceof DatabaseError) {
        errorMessage = 'A database error occurred. Please try again later.';
        errorTitle = 'Database Error';
      } else if (error instanceof ApiError) {
        errorMessage = error.message;
        errorTitle = 'API Error';
      }

      setError(errorMessage);
      toast({
        title: errorTitle,
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const totalTestCases = testRun.testCaseResults?.length ?? 0;

  return (
    <VStack spacing={4} align="stretch">
      <Heading size="md">Generate Test Report for: {testRun.name}</Heading>
      <Text>Status: {testRun.status}</Text>
      <Text>Total Test Cases: {totalTestCases}</Text>
      {error && <ErrorMessage message={error} />}
      <Textarea
        placeholder="Enter report description"
        value={description}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          setDescription(e.target.value)
        }
      />
      <Button
        onClick={handleGenerateReport}
        colorScheme="blue"
        isLoading={isGenerating}
        loadingText="Generating..."
      >
        Generate Report
      </Button>
    </VStack>
  );
}
