import React from 'react';
import { Box, Flex, Select, Input } from '@chakra-ui/react';
import { InputGroup, InputLeftElement } from '@chakra-ui/input';
import { SearchIcon } from '@chakra-ui/icons';

interface SortAndFilterProps {
  sortOptions: { value: string; label: string }[];
  onSortChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  filterPlaceholder?: string;
}

export const SortAndFilter: React.FC<SortAndFilterProps> = ({
  sortOptions,
  onSortChange,
  onFilterChange,
  filterPlaceholder = 'Search...',
}) => {
  return (
    <Flex direction={['column', 'row']} mb={4} gap={4}>
      <Box flex={1}>
        <Select
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onSortChange(e.target.value)
          }
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Box>
      <Box flex={1}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            type="text"
            placeholder={filterPlaceholder}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onFilterChange(e.target.value)
            }
          />
        </InputGroup>
      </Box>
    </Flex>
  );
};
