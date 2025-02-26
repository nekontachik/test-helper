import { ROUTES } from '../routes';
import type { TestRun, TestRunFormData } from '@/models/testRun';

export async function getTestRuns(projectId: string): Promise<TestRun[]> {
  const response = await fetch(ROUTES.API.PROJECT.TEST_RUNS.INDEX(projectId));
  if (!response.ok) {
    throw new Error('Failed to fetch test runs');
  }
  return response.json();
}

export async function getTestRun(
  projectId: string,
  runId: string
): Promise<TestRun | null> {
  const response = await fetch(
    ROUTES.API.PROJECT.TEST_RUNS.SHOW(projectId, runId)
  );
  if (!response.ok) {
    throw new Error('Failed to fetch test run');
  }
  return response.json();
}

export async function createTestRun(
  projectId: string,
  data: TestRunFormData
): Promise<TestRun> {
  const response = await fetch(ROUTES.API.PROJECT.TEST_RUNS.INDEX(projectId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create test run');
  }

  return response.json();
}

export async function updateTestRun(
  projectId: string,
  runId: string,
  data: TestRunFormData
): Promise<TestRun> {
  const response = await fetch(
    ROUTES.API.PROJECT.TEST_RUNS.SHOW(projectId, runId),
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to update test run');
  }

  return response.json();
}

export async function deleteTestRun(
  projectId: string,
  runId: string
): Promise<void> {
  const response = await fetch(
    ROUTES.API.PROJECT.TEST_RUNS.SHOW(projectId, runId),
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete test run');
  }
}
