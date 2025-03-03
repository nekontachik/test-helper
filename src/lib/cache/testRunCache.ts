import { TestRun, TestRunSummary } from '@/types/testRun';
import { redis } from '@/lib/redis';

const CACHE_TTL = 60 * 5; // 5 minutes in seconds

export const testRunCache = {
  /**
   * Get a test run from cache
   */
  async getTestRun(runId: string): Promise<TestRun | null> {
    const cached = await redis.get(`test_run:${runId}`);
    return cached ? JSON.parse(cached) : null;
  },

  /**
   * Set a test run in cache
   */
  async setTestRun(testRun: TestRun): Promise<void> {
    await redis.set(
      `test_run:${testRun.id}`, 
      JSON.stringify(testRun), 
      'EX', 
      CACHE_TTL
    );
  },

  /**
   * Invalidate a test run in cache
   */
  async invalidateTestRun(runId: string): Promise<void> {
    await redis.del(`test_run:${runId}`);
    await redis.del(`test_run_summary:${runId}`);
  },

  /**
   * Get a test run summary from cache
   */
  async getTestRunSummary(runId: string): Promise<TestRunSummary | null> {
    const cached = await redis.get(`test_run_summary:${runId}`);
    return cached ? JSON.parse(cached) : null;
  },

  /**
   * Set a test run summary in cache
   */
  async setTestRunSummary(runId: string, summary: TestRunSummary): Promise<void> {
    await redis.set(
      `test_run_summary:${runId}`, 
      JSON.stringify(summary), 
      'EX', 
      CACHE_TTL
    );
  },

  /**
   * Get test runs for a project from cache
   */
  async getProjectTestRuns(projectId: string): Promise<TestRun[] | null> {
    const cached = await redis.get(`project_test_runs:${projectId}`);
    return cached ? JSON.parse(cached) : null;
  },

  /**
   * Set test runs for a project in cache
   */
  async setProjectTestRuns(projectId: string, testRuns: TestRun[]): Promise<void> {
    await redis.set(
      `project_test_runs:${projectId}`, 
      JSON.stringify(testRuns), 
      'EX', 
      CACHE_TTL
    );
  },

  /**
   * Invalidate test runs for a project in cache
   */
  async invalidateProjectTestRuns(projectId: string): Promise<void> {
    await redis.del(`project_test_runs:${projectId}`);
  }
}; 