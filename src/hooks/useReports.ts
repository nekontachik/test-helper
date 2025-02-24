import useSWR from 'swr';
import { TestReport } from '@/types';

interface UseReportReturn {
  data: TestReport | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

const fetcher = async (url: string): Promise<TestReport> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch report');
  }
  return response.json();
};

export function useReport(projectId: string, reportId: string): UseReportReturn {
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

export function useReports(projectId: string) {
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