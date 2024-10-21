import React from 'react';
import { Box, VStack, Text, Heading, Spinner } from '@chakra-ui/react';
import { useTestCaseVersions } from '@/hooks/useTestCase'; // Updated import
import { TestCaseVersion } from '@/types';

interface TestCaseVersionHistoryProps {
  projectId: string;
  testCaseId: string;
  onVersionChange?: (version: number) => void;
}

export function TestCaseVersionHistory({ projectId, testCaseId, onVersionChange }: TestCaseVersionHistoryProps) {
  const { data: versions, isLoading, error } = useTestCaseVersions(projectId, testCaseId);

  if (isLoading) return <Spinner />;
  if (error) return <Text color="red.500">Error loading versions: {error.message}</Text>;
  if (!versions || versions.length === 0) return <Text>No versions available</Text>;

  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);

  return (
    <Box>
      <Heading size="md" mb={4}>Version History</Heading>
      <VStack align="stretch" spacing={4}>
        {sortedVersions.map((version: TestCaseVersion) => (
          <Box 
            key={version.versionNumber} 
            p={4} 
            borderWidth={1} 
            borderRadius="md" 
            cursor="pointer"
            onClick={() => onVersionChange && onVersionChange(version.versionNumber)}
          >
            <Text fontWeight="bold">Version {version.versionNumber}</Text>
            <Text>{version.title}</Text>
            <Text fontSize="sm">{new Date(version.updatedAt).toLocaleString()}</Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
