import React from 'react';
import type { TestRun } from '@/models/testRun';

interface TestRunDetailsProps {
  testRun: TestRun;
}

export default function TestRunDetails({ testRun }: TestRunDetailsProps): JSX.Element {
  return (
    <div>
      <h2>{testRun.name}</h2>
      <p>Status: {testRun.status}</p>
      {/* Add more details as needed */}
    </div>
  );
}
