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
  useToast
} from '@chakra-ui/react';
import { TestRunReport } from '@/components/test-runs/TestRunReport';
import { TestRunDetailsSkeleton } from '@/components/ui/skeletons/TestRunDetailsSkeleton';

// Define a proper type for the report data
interface TestRunReportData {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  runId: string;
  status: string;
  createdBy: { 
    name: string;
  };
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  executionTime?: number;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    blocked: number;
    notExecuted: number;
    passRate: number;
    completionRate: number;
  };
  testCases: Array<{
    id: string;
    title: string;
    priority: string;
    status: string;
    notes?: string;
    executedAt?: string;
  }>;
}

export default function TestRunReportPage({
  params
}: {
  params: { projectId: string; runId: string }
}): JSX.Element {
  const [report, setReport] = useState<TestRunReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const fetchReport = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/projects/${params.projectId}/test-runs/${params.runId}/report`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch test run report');
        }
        
        const data = await response.json();
        setReport(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load test run report',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReport();
  }, [params.projectId, params.runId, toast]);

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <TestRunDetailsSkeleton />
      </Container>
    );
  }

  if (!report) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4} align="center">
          <Heading size="lg">Report Not Found</Heading>
          <Text>The test run report you&apos;re looking for doesn&apos;t exist.</Text>
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

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justifyContent="space-between">
          <Heading size="lg">Test Run Report</Heading>
          <HStack spacing={4}>
            <Button 
              variant="outline" 
              onClick={() => router.push(`/projects/${params.projectId}/test-runs`)}
            >
              Back to Test Runs
            </Button>
            <Button 
              colorScheme="blue"
              onClick={() => {
                window.print();
              }}
            >
              Export Report
            </Button>
          </HStack>
        </HStack>
        
        <Box 
          p={6} 
          borderWidth="1px" 
          borderRadius="lg" 
          boxShadow="sm"
          bg="white"
        >
          <TestRunReport report={report} />
        </Box>
      </VStack>
    </Container>
  );
} 