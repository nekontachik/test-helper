import React from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Text, VStack } from '@chakra-ui/react';
import type { TestCaseVersion } from '@/types';

interface TestCaseVersionComparisonProps {
  oldVersion: TestCaseVersion;
  newVersion: TestCaseVersion;
}

const TestCaseVersionComparison: React.FC<TestCaseVersionComparisonProps> = ({ oldVersion, newVersion }) => {
  const compareField = (field: keyof TestCaseVersion): JSX.Element | null => {
    if (field === 'steps') {
      return (
        <Tr key={field}>
          <Td>{field}</Td>
          <Td>
            <VStack align="start" spacing={1}>
              {oldVersion.steps.map((step, index) => (
                <Text key={index}>• {step}</Text>
              ))}
            </VStack>
          </Td>
          <Td>
            <VStack align="start" spacing={1}>
              {newVersion.steps.map((step, index) => (
                <Text key={index}>• {step}</Text>
              ))}
            </VStack>
          </Td>
        </Tr>
      );
    }
    if (oldVersion[field] !== newVersion[field]) {
      return (
        <Tr key={field}>
          <Td>{field}</Td>
          <Td>{oldVersion[field]}</Td>
          <Td>{newVersion[field]}</Td>
        </Tr>
      );
    }
    return null;
  };

  return (
    <Box>
      <Text fontSize="xl" fontWeight="bold" mb={4}>Version Comparison</Text>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Field</Th>
            <Th>Version {oldVersion.versionNumber}</Th>
            <Th>Version {newVersion.versionNumber}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {compareField('title')}
          {compareField('description')}
          {compareField('steps')}
          {compareField('expectedResult')}
          {compareField('status')}
          {compareField('priority')}
        </Tbody>
      </Table>
    </Box>
  );
};

export default TestCaseVersionComparison;
