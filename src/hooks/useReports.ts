import useSWR from 'swr';
import type { TestReport } from '@/types';

interface UseReportReturn {
  data: TestReport | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

interface UseReportsReturn {
  data: TestReport[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch data');
  }
  return response.json();
}

export function useReport(projectId: string | undefined, reportId: string | undefined): UseReportReturn {
  const { data, error, isLoading } = useSWR<TestReport>(
    projectId && reportId ? `/api/projects/${projectId}/reports/${reportId}` : null,
    fetcher
  );

  return {
    data,
    isLoading,
    error: error as Error | undefined
  };
}

export function useReports(projectId: string | undefined): UseReportsReturn {
  const { data, error, isLoading } = useSWR<TestReport[]>(
    projectId ? `/api/projects/${projectId}/reports` : null,
    fetcher
  );

  return {
    data,
    isLoading,
    error: error as Error | undefined
  };
} 