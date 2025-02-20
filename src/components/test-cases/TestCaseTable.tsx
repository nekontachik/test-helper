import React from 'react';
import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import type { TestCase } from '@/types';

interface TestCaseTableProps {
  testCases: TestCase[];
  onSort: (field: string) => void;
}

export function TestCaseTable({ testCases, onSort }: TestCaseTableProps) {
  return (
    <Table>
      <Thead>
        <Tr>
          <Th onClick={() => onSort('title')}>Title</Th>
          <Th onClick={() => onSort('status')}>Status</Th>
          <Th onClick={() => onSort('priority')}>Priority</Th>
        </Tr>
      </Thead>
      <Tbody>
        {testCases.map((testCase) => (
          <Tr key={testCase.id}>
            <Td>{testCase.title}</Td>
            <Td>{testCase.status}</Td>
            <Td>{testCase.priority}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
} 