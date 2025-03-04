'use client';

import { VirtualizedList } from '@/components/VirtualizedList';
import { TestResultItem } from '@/components/test-run/TestResultItem';
import type { TestResult } from '@/types';
import { useCallback, useEffect } from 'react';

interface TestResultListProps {
  results: TestResult[];
  height: number;
  itemSize: number;
}

export function TestResultList({ results, height, itemSize }: TestResultListProps): JSX.Element {
  // Define a custom renderer for test results
  const renderTestResult = useCallback(({ item }: { item: TestResult; index: number }) => {
    return <TestResultItem result={item} />;
  }, []);

  // Add event listener for the custom render type
  useEffect(() => {
    // Register the custom renderer
    window.customRenderers = window.customRenderers || {};
    window.customRenderers.testResult = renderTestResult;
    
    return () => {
      // Clean up when component unmounts
      if (window.customRenderers) {
        delete window.customRenderers.testResult;
      }
    };
  }, [renderTestResult]);

  return (
    <VirtualizedList
      data={results}
      height={height}
      itemSize={itemSize}
      renderType="testResult"
    />
  );
} 