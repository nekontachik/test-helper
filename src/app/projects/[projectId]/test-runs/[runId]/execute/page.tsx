'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Progress,
  useToast,
  Flex,
  Spinner
} from '@chakra-ui/react';
import type { TestCase } from '@/types/testCase';
import type { TestRun } from '@/types/testRun';
import { TestCaseExecutionForm } from '@/components/test-runs/TestCaseExecutionForm';
import { TestRunDetailsSkeleton } from '@/components/ui/skeletons/TestRunDetailsSkeleton';

export default function ExecuteTestRunPage({
  params
}: {
  params: { projectId: string; runId: string }
}): JSX.Element {
  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const fetchTestRun = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/projects/${params.projectId}/test-runs/${params.runId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch test run');
        }
        
        const data = await response.json();
        setTestRun(data);
        
        // Fetch test cases
        const testCasesResponse = await fetch(
          `/api/projects/${params.projectId}/test-cases?ids=${data.testCaseIds.join(',')}`
        );
        
        if (!testCasesResponse.ok) {
          throw new Error('Failed to fetch test cases');
        }
        
        const testCasesData = await testCasesResponse.json();
        setTestCases(testCasesData);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load test run',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTestRun();
  }, [params.projectId, params.runId, toast]);

  const handleComplete = (): void => {
    if (currentIndex < testCases.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      completeTestRun();
    }
  };

  const completeTestRun = async (): Promise<void> => {
    try {
      setIsCompleting(true);
      
      // Navigate to the report page
      router.push(`/projects/${params.projectId}/test-runs/${params.runId}/report`);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to complete test run',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <TestRunDetailsSkeleton />
      </Container>
    );
  }

  if (!testRun || testCases.length === 0) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4} align="center">
          <Heading size="lg">Test Run Not Found</Heading>
          <Text>The test run you&apos;re looking for doesn&apos;t exist or has no test cases.</Text>
          <Button 
            colorScheme="blue" 
            onClick={() => router.push(`/projects/${params.projectId}/test-runs`)}
          >
            Back to Test Runs
          </Button>
        </VStack>
      </Container>
    );
  }

  const currentTestCase = testCases[currentIndex];
  const progress = ((currentIndex) / testCases.length) * 100;

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justifyContent="space-between">
          <Heading size="lg">Execute Test Run: {testRun.name}</Heading>
          <Button 
            variant="outline" 
            onClick={() => router.push(`/projects/${params.projectId}/test-runs`)}
          >
            Cancel
          </Button>
        </HStack>
        
        <Box>
          <Flex justify="space-between" mb={2}>
            <Text>Progress: {currentIndex} of {testCases.length} completed</Text>
            <Text>{Math.round(progress)}%</Text>
          </Flex>
          <Progress value={progress} size="sm" colorScheme="blue" borderRadius="md" />
        </Box>
        
        {isCompleting ? (
          <Flex justify="center" align="center" direction="column" py={10}>
            <Spinner size="xl" mb={4} />
            <Text>Completing test run...</Text>
          </Flex>
        ) : (
          <TestCaseExecutionForm
            testCase={currentTestCase!}
            projectId={params.projectId}
            testRunId={params.runId}
            onComplete={handleComplete}
            isLast={currentIndex === testCases.length - 1}
          />
        )}
      </VStack>
    </Container>
  );
} 