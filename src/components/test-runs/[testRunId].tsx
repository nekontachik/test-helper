import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { TestRun } from '@/models/testRun';

interface TestRunDetailsProps {
  testRun: TestRun;
}

export default function TestRunDetails({ testRun }: TestRunDetailsProps) {
  const router = useRouter();
  const { testRunId } = router.query;

  useEffect(() => {
    if (testRunId && !testRun) {
      // Fetch test run details using testRunId if not provided
      // This is just a placeholder, implement the actual fetching logic
      console.log(`Fetching test run details for ${testRunId}`);
    }
  }, [testRunId, testRun]);

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
