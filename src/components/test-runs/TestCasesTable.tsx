import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge
} from '@chakra-ui/react';
import { formatDate, getStatusColor } from './utils/formatters';

interface TestCase {
  id: string;
  title: string;
  priority: string;
  status: string;
  notes?: string;
  executedAt?: string;
}

interface TestCasesTableProps {
  testCases: TestCase[];
}

export function TestCasesTable({ testCases }: TestCasesTableProps): JSX.Element {
  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Title</Th>
            <Th>Priority</Th>
            <Th>Status</Th>
            <Th>Executed At</Th>
            <Th>Notes</Th>
          </Tr>
        </Thead>
        <Tbody>
          {testCases.map((testCase) => (
            <Tr key={testCase.id}>
              <Td>{testCase.title}</Td>
              <Td>{testCase.priority}</Td>
              <Td>
                <Badge colorScheme={getStatusColor(testCase.status)}>
                  {testCase.status}
                </Badge>
              </Td>
              <Td>{formatDate(testCase.executedAt)}</Td>
              <Td>{testCase.notes || '-'}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
} 