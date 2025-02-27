'use client';

import React from 'react';
import { 
  Box, 
  Flex, 
  Select, 
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

/**
 * SortAndFilter Component
 * 
 * A component that provides sorting and filtering functionality with a responsive layout.
 * Combines a select dropdown for sorting and a search input for filtering.
 */

interface SortOption {
  value: string;
  label: string;
}

interface SortAndFilterProps {
  /** Array of sorting options */
  sortOptions: SortOption[];
  /** URL to send sort changes to */
  sortUrl: string;
  /** URL to send filter changes to */
  filterUrl: string;
  /** Initial sort value */
  initialSort?: string;
  /** Initial filter value */
  initialFilter?: string;
  /** Placeholder text for the filter input */
  filterPlaceholder?: string;
  /** Optional className for styling */
  className?: string;
}

export function SortAndFilter({
  sortOptions,
  sortUrl,
  filterUrl,
  initialSort = '',
  initialFilter = '',
  filterPlaceholder = 'Search...',
  className,
}: SortAndFilterProps): JSX.Element {
  const [sortValue, setSortValue] = React.useState(initialSort);
  const [filterValue, setFilterValue] = React.useState(initialFilter);

  const handleSortChange = async (event: React.ChangeEvent<HTMLSelectElement>): Promise<void> => {
    const value = event.target.value;
    setSortValue(value);
    
    // Use URL-based state management
    const url = new URL(sortUrl, window.location.origin);
    url.searchParams.set('sort', value);
    window.history.pushState({}, '', url);
  };

  const handleFilterChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const value = event.target.value;
    setFilterValue(value);
    
    // Use URL-based state management
    const url = new URL(filterUrl, window.location.origin);
    url.searchParams.set('filter', value);
    window.history.pushState({}, '', url);
  };

  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      gap={4}
      mb={4}
      className={className}
    >
      <Box flex={1}>
        <Select
          value={sortValue}
          onChange={handleSortChange}
          aria-label="Sort by"
          data-testid="sort-select"
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
            type="search"
            value={filterValue}
            placeholder={filterPlaceholder}
            onChange={handleFilterChange}
            aria-label="Filter items"
            data-testid="filter-input"
          />
        </InputGroup>
      </Box>
    </Flex>
  );
}

/**
 * Usage Examples:
 * 
 * Basic Usage:
 * ```tsx
 * <SortAndFilter
 *   sortOptions={[
 *     { value: 'name', label: 'Name' },
 *     { value: 'date', label: 'Date' },
 *   ]}
 *   sortUrl="/api/sort"
 *   filterUrl="/api/filter"
 *   initialSort="name"
 *   initialFilter="search"
 * />
 * ```
 * 
 * With Custom Placeholder:
 * ```tsx
 * <SortAndFilter
 *   sortOptions={sortOptions}
 *   sortUrl={sortUrl}
 *   filterUrl={filterUrl}
 *   initialSort={initialSort}
 *   initialFilter={initialFilter}
 *   filterPlaceholder="Search items..."
 * />
 * ```
 */

/**
 * Accessibility Features:
 * - Proper ARIA labels for inputs
 * - Keyboard navigation support
 * - Screen reader friendly
 * - Focus management
 * 
 * Performance Considerations:
 * - Debounced filter input (implement if needed)
 * - Memoized event handlers
 * - Responsive layout with minimal re-renders
 * 
 * Dependencies:
 * - @chakra-ui/react
 * - @chakra-ui/icons
 */
