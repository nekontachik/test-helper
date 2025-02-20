import React from 'react';
import { VStack, Text, Box } from '@chakra-ui/react';

interface Version {
  id: string;
  versionNumber: number;
  title: string;
  description: string | null;
  createdAt: string;
  status: string;
  priority: string;
  expectedResult: string | null;
}

interface TestCaseVersionHistoryProps {
  versions: Version[];
  onVersionSelect?: (version: Version) => void;
  currentVersion?: number;
}

export const TestCaseVersionHistory: React.FC<TestCaseVersionHistoryProps> = ({ 
  versions,
  onVersionSelect,
  currentVersion 
}) => {
  return (
    <VStack spacing={4} align="stretch">
      {versions.map((version) => (
        <Box 
          key={version.id}
          p={4}
          borderWidth={1}
          borderRadius="md"
          cursor={onVersionSelect ? 'pointer' : 'default'}
          onClick={() => onVersionSelect?.(version)}
          bg={currentVersion === version.versionNumber ? 'blue.50' : 'white'}
        >
          <Text fontWeight="bold">Version {version.versionNumber}</Text>
          <Text>{version.title}</Text>
          <Text fontSize="sm" color="gray.500">
            {new Date(version.createdAt).toLocaleDateString()}
          </Text>
          <Text fontSize="sm" color="gray.600">
            Status: {version.status}
          </Text>
          <Text fontSize="sm" color="gray.600">
            Priority: {version.priority}
          </Text>
        </Box>
      ))}
    </VStack>
  );
};
