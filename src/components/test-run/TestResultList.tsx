'use client';

import { VirtualizedList } from '@/components/VirtualizedList';
import { TestResultItem } from '@/components/TestResultItem';
import type { TestResult } from '@/types';

interface TestResultListProps {
  results: TestResult[];
  height: number;
  itemSize: number;
}

export function TestResultList({ results, height, itemSize }: TestResultListProps): JSX.Element {
  return (
    <VirtualizedList
      data={results}
      height={height}
      itemSize={itemSize}
      renderItem={({ item }) => (
        <TestResultItem result={item} />
      )}
    />
  );
} 