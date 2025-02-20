import React from 'react';
import { FixedSizeList } from 'react-window';
import type { TestCase } from '@/types';

interface TestCaseItemProps {
  testCase: TestCase;
  style: React.CSSProperties;
}

const TestCaseItem = React.memo(({ testCase, style }: TestCaseItemProps) => (
  <div 
    style={style}
    className="p-4 border-b hover:bg-gray-50"
  >
    <h3 className="font-medium">{testCase.title}</h3>
    <p className="text-sm text-gray-500">{testCase.description}</p>
  </div>
));

TestCaseItem.displayName = 'TestCaseItem';

export function TestCaseList({ testCases }: { testCases: TestCase[] }) {
  const Row = React.useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => (
    <TestCaseItem 
      testCase={testCases[index]}
      style={style}
    />
  ), [testCases]);

  return (
    <FixedSizeList
      height={500}
      width="100%"
      itemCount={testCases.length}
      itemSize={100}
    >
      {Row}
    </FixedSizeList>
  );
} 