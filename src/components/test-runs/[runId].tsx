'use client';

import { useParams } from 'next/navigation';
import type { TestRun } from '@/models/testRun';

interface TestRunDetailsProps {
  testRun: TestRun;
}

export default function TestRunDetails({ testRun }: TestRunDetailsProps): JSX.Element {
  const params = useParams();
  const _runId = params?.runId as string;

  if (!testRun) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{testRun.name}</h1>
      <p>Status: {testRun.status}</p>
      {/* Add more details about the test run */}
    </div>
  );
}
