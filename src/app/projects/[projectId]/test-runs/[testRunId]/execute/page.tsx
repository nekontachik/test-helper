'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTestRun } from '@/hooks/useTestRuns';
import { ExecuteTestRun } from '@/components/ExecuteTestRun';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useToast } from '@/hooks/useToast';

export default function ExecuteTestRunPage() {
  const params = useParams();
  const router = useRouter();
  const { showSuccessToast } = useToast();

  const projectId = params?.projectId as string;
  const testRunId = params?.testRunId as string;

  const { data: testRun, isLoading, error } = useTestRun(projectId, testRunId);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !testRun) {
    return <ErrorMessage message={error?.message || 'Test run not found'} />;
  }

  const handleComplete = () => {
    showSuccessToast('Test run completed successfully');
    router.push(`/projects/${projectId}/test-runs/${testRunId}`);
  };

  const handleCancel = () => {
    router.push(`/projects/${projectId}/test-runs/${testRunId}`);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Execute Test Run: {testRun.name}</h1>
      <ExecuteTestRun
        testCases={testRun.testCases || []}
        projectId={projectId}
        testRunId={testRunId}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </div>
  );
} 