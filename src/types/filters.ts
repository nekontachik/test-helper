import type { TestCaseStatus, TestCasePriority } from '@/types/testCase';

export interface TestCaseFilters {
  status?: TestCaseStatus[];
  priority?: TestCasePriority[];
  search?: string;
  page?: number;
  limit?: number;
}

export interface QueryFilters extends Record<string, string | string[] | number | undefined> {
  page?: number;
  limit?: number;
  search?: string;
}

export function serializeFilters(filters: QueryFilters): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        params.append(key, value.join(','));
      } else {
        params.append(key, String(value));
      }
    }
  });

  return params;
} 