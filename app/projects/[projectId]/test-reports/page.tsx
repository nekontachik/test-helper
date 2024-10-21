'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Box, Heading, VStack, Text } from '@chakra-ui/react';
import { useTestReports } from '@/hooks/useTestReports';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { TestReport } from '@/types';

export default function TestReportsPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { data: testReports, isLoading, error } = useTestReports(projectId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  return (
    <Box p={4}>
      <Heading mb={6}>Test Reports</Heading>
      {testReports && testReports.length > 0 ? (
        <VStack spacing={4} align="stretch">
          {testReports.map((report: TestReport) => (
            <Box key={report.id} p={4} borderWidth={1} borderRadius="md">
              <Text fontWeight="bold">{report.name}</Text>
              <Text>
                Created: {new Date(report.createdAt).toLocaleString()}
              </Text>
            </Box>
          ))}
        </VStack>
      ) : (
        <Text>No test reports available.</Text>
      )}
    </Box>
  );
}
