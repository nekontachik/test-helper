import {
  VStack,
  Heading,
  Divider
} from '@chakra-ui/react';
import { TestRunHeader } from './TestRunHeader';
import { TestRunSummary } from './TestRunSummary';
import { TestCasesTable } from './TestCasesTable';

interface TestRunReportProps {
  report: {
    id: string;
    name: string;
    description?: string;
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
  };
}

export function TestRunReport({ report }: TestRunReportProps): JSX.Element {
  return (
    <VStack spacing={6} align="stretch">
      <TestRunHeader 
        name={report.name}
        description={report.description}
        status={report.status}
        createdBy={report.createdBy}
        createdAt={report.createdAt}
        startedAt={report.startedAt}
        completedAt={report.completedAt}
        executionTime={report.executionTime}
      />
      
      <Divider />
      
      <Heading size="md">Summary</Heading>
      <TestRunSummary summary={report.summary} />
      
      <Divider />
      
      <Heading size="md">Test Cases</Heading>
      <TestCasesTable testCases={report.testCases} />
    </VStack>
  );
} 