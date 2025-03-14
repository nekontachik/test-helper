'use client';

import React, { useState } from 'react';
import { useTestCase } from '@/hooks/useTestCase';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Badge,
  Flex,
  Spinner,
  useToast,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Stack,
} from '@chakra-ui/react';
import { EditTestCaseForm } from './EditTestCaseForm';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { handleApiError } from '@/lib/errorReporting';
import type { TestCaseFormData } from '@/types';
import { TestCaseStatus, TestCasePriority } from '@/types';

interface TestCaseDetailsProps {
  projectId: string;
  testCaseId: string;
}

export function TestCaseDetails({ projectId, testCaseId }: TestCaseDetailsProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const { data: testCase, isLoading, error } = useTestCase(projectId, testCaseId);
  const toast = useToast();

  const handleDelete = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/projects/${projectId}/test-cases/${testCaseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete test case');
      }

      toast({
        title: 'Test case deleted',
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      handleApiError(err);
      toast({
        title: 'Error',
        description: 'Failed to delete test case',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleEditSubmit = async (formData: TestCaseFormData): Promise<void> => {
    try {
      const response = await fetch(`/api/projects/${projectId}/test-cases/${testCaseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update test case');
      }
      
      setIsEditing(false);
      toast({
        title: 'Test case updated',
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      handleApiError(err);
      toast({
        title: 'Error',
        description: 'Failed to update test case',
        status: 'error',
        duration: 5000,
      });
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={4} bg="red.50" color="red.500" borderRadius="md">
        Error: {error.message}
      </Box>
    );
  }

  if (!testCase) {
    return (
      <Box p={4} bg="gray.50" borderRadius="md">
        Test case not found
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading as="h1" size="lg">
              {testCase.title}
            </Heading>
            <Stack direction="row" spacing={2}>
              <Badge colorScheme={testCase.status === TestCaseStatus.ACTIVE ? 'green' : 'red'}>
                {testCase.status}
              </Badge>
              <Badge 
                colorScheme={
                  testCase.priority === TestCasePriority.HIGH 
                    ? 'red' 
                    : testCase.priority === TestCasePriority.MEDIUM 
                    ? 'yellow' 
                    : 'blue'
                }
              >
                {testCase.priority}
              </Badge>
            </Stack>
          </Flex>
        </CardHeader>

        <CardBody>
          <VStack align="stretch" spacing={4}>
            {!isEditing ? (
              <>
                <Text fontWeight="medium">Description</Text>
                <Text>{testCase.description}</Text>
                <Text fontWeight="medium">Steps</Text>
                <Text whiteSpace="pre-line">{testCase.steps}</Text>
                <Text fontWeight="medium">Expected Result</Text>
                <Text>{testCase.expectedResult}</Text>
              </>
            ) : (
              <EditTestCaseForm 
                testCase={testCase}
                onSubmit={handleEditSubmit}
              />
            )}
          </VStack>
        </CardBody>

        <Divider />

        <CardFooter>
          <Flex gap={4}>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              colorScheme="blue"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
            <Button
              onClick={handleDelete}
              colorScheme="red"
              isDisabled={isEditing}
            >
              Delete
            </Button>
          </Flex>
        </CardFooter>
      </Card>
    </ErrorBoundary>
  );
}
