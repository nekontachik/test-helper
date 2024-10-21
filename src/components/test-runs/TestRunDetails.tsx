import React from 'react';
import { TestRun } from '@/models/testRun';

interface TestRunDetailsProps {
  testRun: TestRun;
}

export default function TestRunDetails({ testRun }: TestRunDetailsProps) {
  return (
    <div>
      <h2>{testRun.name}</h2>
      <p>Status: {testRun.status}</p>
      {/* Add more details as needed */}
    </div>
  );
}
