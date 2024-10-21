import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { TestRun, TestCaseResult } from '../../../../../models/testRun';
import { getTestRun, updateTestRun } from '../../../../../lib/api/testRuns';
import { ErrorMessage } from '../../../../../components/ErrorMessage';

interface ExecuteTestRunPageProps {
  testRun: TestRun | null;
}

export const getServerSideProps: GetServerSideProps<
  ExecuteTestRunPageProps
> = async (context) => {
  const { projectId, testRunId } = context.params as {
    projectId: string;
    testRunId: string;
  };
  try {
    const testRun = await getTestRun(projectId, testRunId);
    return { props: { testRun } };
  } catch (error) {
    console.error('Error fetching test run:', error);
    return { props: { testRun: null } };
  }
};

export default function ExecuteTestRunPage({
  testRun,
}: ExecuteTestRunPageProps) {
  const router = useRouter();
  const { projectId } = router.query;
  const [results, setResults] = useState<TestCaseResult[]>(
    testRun?.testCases?.map((testCase) => ({
      id: '',
      testCaseId: testCase.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })) || []
  );

  if (!testRun) {
    return <ErrorMessage message="Failed to load test run" />;
  }

  const handleStatusChange = (testCaseId: string, newStatus: string) => {
    setResults((prevResults) =>
      prevResults.map((result) =>
        result.testCaseId === testCaseId
          ? { ...result, status: newStatus }
          : result
      )
    );
  };

  const handleSubmit = async () => {
    if (typeof projectId !== 'string') return;
    try {
      await updateTestRun(projectId, testRun.id, {
        name: testRun.name,
        status: 'completed',
        testCases: results.map((result) => ({
          testCaseId: result.testCaseId,
          status: result.status,
          notes: '',
        })),
        testSuiteId: testRun.testSuiteId || undefined,
      });
      console.log('Submitting results:', results);
      router.push(`/projects/${projectId}/test-runs/${testRun.id}`);
    } catch (error) {
      console.error('Error updating test run:', error);
    }
  };

  return (
    <div>
      <h1>Execute Test Run: {testRun.name}</h1>
      {testRun.testCases?.map((testCase) => (
        <div key={testCase.id}>
          <h3>{testCase.title}</h3>
          <select
            value={
              results.find((r) => r.testCaseId === testCase.id)?.status ||
              'pending'
            }
            onChange={(e) => handleStatusChange(testCase.id, e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="skipped">Skipped</option>
          </select>
        </div>
      ))}
      <button onClick={handleSubmit}>Submit Results</button>
    </div>
  );
}
