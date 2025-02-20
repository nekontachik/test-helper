'use client';

import { useParams } from 'next/navigation';
import { TestRun } from '@/models/testRun';

interface TestRunDetailProps {
  testRun: TestRun;
}

export default function TestRunDetail({ testRun }: TestRunDetailProps) {
  const params = useParams<{ runId: string }>();
  const runId = params?.runId;

  if (!testRun || !runId) {
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