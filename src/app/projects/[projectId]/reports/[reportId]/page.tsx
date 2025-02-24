'use client';

import { useParams } from 'next/navigation';
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Text,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Card,
  CardBody,
  Grid,
  GridItem
} from '@chakra-ui/react';
import { FiDownload } from 'react-icons/fi';
import { useReport } from '@/hooks/useReports';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { TestCaseResultStatus, type TestCase, type TestReport } from '@/types';
import { formatDate } from '@/lib/utils/date';
import { generatePDF } from '@/lib/utils/pdf';

interface TestReportStatistics {
  totalTests: number;
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  passRate: number;
}

interface TestReportResult {
  testCaseId: string;
  status: TestCaseResultStatus;
  notes?: string;
  executedBy: string;
  executedAt: string;
  testCase: TestCase;
}

type PDFReport = TestReport & {
  name: string;
  description: string;
  statistics: TestReportStatistics;
  results: TestReportResult[];
};

interface ReportWithDetails extends Omit<TestReport, 'description'> {
  name: string;
  description?: string;
  statistics: TestReportStatistics;
  results: TestReportResult[];
}

export default function ReportPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const reportId = params?.reportId as string;
  
  const { data: report, isLoading, error } = useReport(projectId, reportId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;
  if (!report) return <ErrorAlert message="Report not found" />;

  const handleDownloadPDF = () => {
    const pdfReport: PDFReport = {
      ...report as ReportWithDetails,
      description: (report as ReportWithDetails).description || ''
    };
    generatePDF(pdfReport);
  };

  const reportWithDetails = report as unknown as ReportWithDetails;

  return (
    <Box className="container mx-auto py-8">
      <HStack justify="space-between" mb={6}>
        <Heading>Test Report: {reportWithDetails.name}</Heading>
        <Button
          leftIcon={<FiDownload />}
          colorScheme="blue"
          onClick={handleDownloadPDF}
        >
          Download PDF
        </Button>
      </HStack>

      <VStack spacing={6} align="stretch">
        <Card>
          <CardBody>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <Text fontWeight="bold">Description</Text>
                <Text>{reportWithDetails.description || 'No description provided'}</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Created At</Text>
                <Text>{formatDate(reportWithDetails.createdAt)}</Text>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Test Results</Heading>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Test Case</Th>
                  <Th>Status</Th>
                  <Th>Notes</Th>
                  <Th>Executed By</Th>
                  <Th>Executed At</Th>
                </Tr>
              </Thead>
              <Tbody>
                {reportWithDetails.results?.map((result: TestReportResult) => (
                  <Tr key={result.testCaseId}>
                    <Td>{result.testCase.title}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </Td>
                    <Td>{result.notes || '-'}</Td>
                    <Td>{result.executedBy}</Td>
                    <Td>{formatDate(result.executedAt)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}

function getStatusColor(status: TestCaseResultStatus) {
  switch (status) {
    case TestCaseResultStatus.PASSED:
      return 'green';
    case TestCaseResultStatus.FAILED:
      return 'red';
    case TestCaseResultStatus.SKIPPED:
      return 'gray';
    default:
      return 'gray';
  }
} 