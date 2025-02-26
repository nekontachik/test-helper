import React from 'react';
import { Box, Select } from '@chakra-ui/react';
import { TestCaseStatus } from '@/types';
import type { TestCaseFilters as Filters } from '../TestCaseList';

interface TestCaseFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function TestCaseFilters({ filters, onChange }: TestCaseFiltersProps): JSX.Element {
  return (
    <Box>
      <Select
        value={filters.status[0]}
        onChange={(e) => onChange({ ...filters, status: [e.target.value as TestCaseStatus] })}
      >
        {Object.values(TestCaseStatus).map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </Select>
    </Box>
  );
} 