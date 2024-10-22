import React from 'react';
import { Box, VStack, Text, Heading, Spinner, Button } from '@chakra-ui/react';
import { useTestCaseVersions } from '@/hooks/useTestCase';
import { TestCaseVersion } from '@/types';
import ErrorBoundary from '@/components/ErrorBoundary';

interface TestCaseVersionHistoryProps {
  projectId: string;
  testCaseId: string;
  onVersionRestore: (version: number) => void;
}

export function TestCaseVersionHistory({ projectId, testCaseId, onVersionRestore }: TestCaseVersionHistoryProps) {
  const { data: versions, isLoading, error } = useTestCaseVersions(projectId, testCaseId);

  if (isLoading) return <Spinner />;
  if (error) return <Text color="red.500">Error loading versions: {error.message}</Text>;
  if (!versions || versions.length === 0) return <Text>No versions available</Text>;

  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);

  return (
    <ErrorBoundary>
      <Box>
        <Heading size="md" mb={4}>Version History</Heading>
        <VStack align="stretch" spacing={4}>
          {sortedVersions.map((version: TestCaseVersion) => (
            <Box 
              key={version.versionNumber} 
              p={4} 
              borderWidth={1} 
              borderRadius="md" 
              boxShadow="sm"
            >
              <Text fontWeight="bold">Version {version.versionNumber}</Text>
              <Text>{version.title}</Text>
              <Text fontSize="sm" color="gray.500">{new Date(version.createdAt).toLocaleString()}</Text>
              <Button 
                size="sm" 
                mt={2} 
                colorScheme="blue"
                onClick={() => onVersionRestore(version.versionNumber)}
              >
                Restore this version
              </Button>
            </Box>
          ))}
        </VStack>
      </Box>
    </ErrorBoundary>
  );
}
