import React from 'react';
import { TestCase } from '@/models/testCase';

interface TestCaseItemProps {
  testCase: TestCase;
}

export const TestCaseItem: React.FC<TestCaseItemProps> = ({ testCase }) => {
  return (
    <div>
      <h3>{testCase.title}</h3>
      <p>Status: {testCase.status}</p>
      <p>Priority: {testCase.priority}</p>
    </div>
  );
};
