import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import type { TestRun, TestRunFormData, TestRunStatus } from '../types';
import type { TestCaseResult } from '@prisma/client';
import apiClient from '../lib/apiClient';
import { toast } from 'react-hot-toast';
import { logger } from '../lib/utils/logger';

type TestRunQueryResult = {
  items: TestRun[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateTestRunVariables {
  projectId: string;
  testRun: TestRunFormData;
}

interface UpdateTestRunVariables {
  runId: string;
  status: TestRunStatus;
  testCaseResults: TestCaseResult[];
}

interface BulkDeleteTestRunsVariables {
  projectId: string;
  runIds: string[];
}

interface TestRunsOptions {
  enabled?: boolean;
  staleTime?: number;
  retry?: boolean | number;
  retryDelay?: number;
  showToasts?: boolean;
  filters?: {
    status?: TestRunStatus;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    userId?: string;
  };
}

// Custom error class with error code support
export class TestRunError extends Error {
  code: string;
  
  constructor(message: string, code = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'TestRunError';
    this.code = code;
  }
}

// Helper function to determine if an error is a network error
function isNetworkError(error: unknown): boolean {
  return error instanceof Error && 
    (error.message.includes('network') || 
     error.message.includes('fetch') || 
     error.message.includes('Failed to fetch') ||
     error.message.includes('Network request failed'));
}

// Helper function to create a retry delay with exponential backoff
function getRetryDelay(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 seconds
}

export function useTestRuns(
  projectId: string,
  page = 1,
  limit = 10,
  options: TestRunsOptions = {}
): UseQueryResult<TestRunQueryResult, Error> {
  return useQuery<TestRunQueryResult, Error>({
    queryKey: ['testRuns', projectId, page, limit, options.filters],
    queryFn: async () => {
      const startTime = performance.now();
      logger.debug('Fetching test runs', { 
        projectId, 
        page, 
        limit,
        filters: options.filters 
      });
      
      try {
        const result = await apiClient.getTestRuns(projectId, { 
          page, 
          limit,
          ...options.filters
        });
        
        const duration = Math.round(performance.now() - startTime);
        logger.debug('Test runs fetched successfully', { 
          projectId, 
          count: result.items.length,
          total: result.total,
          duration: `${duration}ms`
        });
        
        return result;
      } catch (error) {
        const duration = Math.round(performance.now() - startTime);
        const networkError = isNetworkError(error);
        
        logger.error('Failed to fetch test runs', { 
          projectId, 
          page, 
          limit,
          filters: options.filters,
          duration: `${duration}ms`,
          isNetworkError: networkError,
          error: error instanceof Error ? error.message : String(error)
        });
        
        if (networkError) {
          throw new TestRunError(
            'Network error: Please check your connection and try again',
            'NETWORK_ERROR'
          );
        }
        
        // Handle API-specific error codes
        if (error instanceof Error && error.message.includes('not found')) {
          throw new TestRunError(
            'Project not found or you don\'t have access to it',
            'NOT_FOUND'
          );
        }
        
        if (error instanceof Error && error.message.includes('unauthorized')) {
          throw new TestRunError(
            'You don\'t have permission to access these test runs',
            'UNAUTHORIZED'
          );
        }
        
        throw error instanceof Error 
          ? new TestRunError(error.message)
          : new TestRunError('Failed to fetch test runs');
      }
    },
    enabled: !!projectId && (options.enabled ?? true),
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
    retry: options.retry ?? 3,
    retryDelay: options.retryDelay !== undefined 
      ? options.retryDelay 
      : getRetryDelay,
  });
}

export function useCreateTestRun(options: { showToasts?: boolean } = {}): UseMutationResult<
  TestRun,
  Error,
  CreateTestRunVariables,
  { previousTestRuns: TestRunQueryResult | undefined }
> {
  const queryClient = useQueryClient();
  const showToasts = options.showToasts ?? true;
  
  return useMutation<TestRun, Error, CreateTestRunVariables, { previousTestRuns: TestRunQueryResult | undefined }>({
    mutationFn: async ({ projectId, testRun }) => {
      const startTime = performance.now();
      logger.debug('Creating test run', { projectId, testRun });
      
      try {
        const result = await apiClient.createTestRun(projectId, testRun);
        
        const duration = Math.round(performance.now() - startTime);
        logger.debug('Test run created successfully', { 
          projectId, 
          testRunId: result.id,
          duration: `${duration}ms`
        });
        
        return result;
      } catch (error) {
        const duration = Math.round(performance.now() - startTime);
        const networkError = isNetworkError(error);
        
        logger.error('Failed to create test run', { 
          projectId, 
          testRun,
          duration: `${duration}ms`,
          isNetworkError: networkError,
          error: error instanceof Error ? error.message : String(error)
        });
        
        if (networkError) {
          throw new TestRunError(
            'Network error: Please check your connection and try again',
            'NETWORK_ERROR'
          );
        }
        
        // Handle validation errors
        if (error instanceof Error && error.message.includes('validation')) {
          throw new TestRunError(
            'Invalid test run data: Please check your inputs',
            'VALIDATION_ERROR'
          );
        }
        
        throw error instanceof Error 
          ? new TestRunError(error.message)
          : new TestRunError('Failed to create test run');
      }
    },
    onMutate: async ({ projectId, testRun }) => {
      await queryClient.cancelQueries({ queryKey: ['testRuns', projectId] });
      const previousTestRuns = queryClient.getQueryData<TestRunQueryResult>(['testRuns', projectId]);
      
      // Optimistically update the test runs list
      if (previousTestRuns) {
        const now = new Date().toISOString();
        
        // Create a partial test run for optimistic update with proper type casting
        const optimisticTestRun = {
          id: `temp-${Date.now()}`,
          name: testRun.name,
          projectId,
          status: testRun.status,
          testCases: [],
          createdAt: now,
          updatedAt: now,
        };
        
        queryClient.setQueryData<TestRunQueryResult>(
          ['testRuns', projectId],
          {
            ...previousTestRuns,
            items: [(optimisticTestRun as unknown) as TestRun, ...previousTestRuns.items],
            total: previousTestRuns.total + 1
          }
        );
      }
      
      return { previousTestRuns };
    },
    onError: (error, variables, context) => {
      if (context?.previousTestRuns) {
        queryClient.setQueryData(['testRuns', variables.projectId], context.previousTestRuns);
      }
      if (showToasts) {
        let errorMessage = 'Failed to create test run';
        
        if (error instanceof TestRunError) {
          switch (error.code) {
            case 'NETWORK_ERROR':
              errorMessage = error.message;
              break;
            case 'VALIDATION_ERROR':
              errorMessage = error.message;
              break;
            default:
              errorMessage = `Failed to create test run: ${error.message}`;
          }
        } else if (error instanceof Error) {
          errorMessage = `Failed to create test run: ${error.message}`;
        }
        
        toast.error(errorMessage);
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['testRuns', variables.projectId],
      });
      if (showToasts) {
        toast.success('Test run created successfully');
      }
    },
  });
}

export function useDeleteTestRun(
  projectId: string,
  options: { showToasts?: boolean } = {}
): UseMutationResult<void, Error, string, { previousTestRuns: TestRunQueryResult | undefined }> {
  const queryClient = useQueryClient();
  const showToasts = options.showToasts ?? true;
  
  return useMutation<void, Error, string, { previousTestRuns: TestRunQueryResult | undefined }>({
    mutationFn: async (runId: string) => {
      const startTime = performance.now();
      logger.debug('Deleting test run', { projectId, runId });
      
      try {
        await apiClient.deleteTestRun(projectId, runId);
        
        const duration = Math.round(performance.now() - startTime);
        logger.debug('Test run deleted successfully', { 
          projectId, 
          runId,
          duration: `${duration}ms`
        });
      } catch (error) {
        const duration = Math.round(performance.now() - startTime);
        const networkError = isNetworkError(error);
        
        logger.error('Failed to delete test run', { 
          projectId, 
          runId,
          duration: `${duration}ms`,
          isNetworkError: networkError,
          error: error instanceof Error ? error.message : String(error)
        });
        
        if (networkError) {
          throw new TestRunError(
            'Network error: Please check your connection and try again',
            'NETWORK_ERROR'
          );
        }
        
        // Handle not found errors
        if (error instanceof Error && error.message.includes('not found')) {
          throw new TestRunError(
            'Test run not found or already deleted',
            'NOT_FOUND'
          );
        }
        
        throw error instanceof Error 
          ? new TestRunError(error.message)
          : new TestRunError('Failed to delete test run');
      }
    },
    onMutate: async (runId) => {
      await queryClient.cancelQueries({ queryKey: ['testRuns', projectId] });
      const previousTestRuns = queryClient.getQueryData<TestRunQueryResult>(['testRuns', projectId]);

      // Optimistically remove the test run from the list
      queryClient.setQueryData<TestRunQueryResult | undefined>(
        ['testRuns', projectId],
        (old) => old && {
          ...old,
          items: old.items.filter(run => run.id !== runId),
          total: old.total - 1,
        }
      );

      return { previousTestRuns };
    },
    onError: (error, runId, context) => {
      if (context?.previousTestRuns) {
        queryClient.setQueryData(['testRuns', projectId], context.previousTestRuns);
      }
      if (showToasts) {
        let errorMessage = 'Failed to delete test run';
        
        if (error instanceof TestRunError) {
          switch (error.code) {
            case 'NETWORK_ERROR':
              errorMessage = error.message;
              break;
            case 'NOT_FOUND':
              errorMessage = error.message;
              break;
            default:
              errorMessage = `Failed to delete test run: ${error.message}`;
          }
        } else if (error instanceof Error) {
          errorMessage = `Failed to delete test run: ${error.message}`;
        }
        
        toast.error(errorMessage);
      }
    },
    onSuccess: (_, runId) => {
      queryClient.invalidateQueries({ queryKey: ['testRuns', projectId] });
      // Also remove the specific test run from cache
      queryClient.removeQueries({ queryKey: ['testRun', projectId, runId] });
      if (showToasts) {
        toast.success('Test run deleted successfully');
      }
    },
  });
}

export function useBulkDeleteTestRuns(
  options: { showToasts?: boolean } = {}
): UseMutationResult<
  void, 
  Error, 
  BulkDeleteTestRunsVariables, 
  { previousTestRuns: TestRunQueryResult | undefined }
> {
  const queryClient = useQueryClient();
  const showToasts = options.showToasts ?? true;
  
  return useMutation<
    void, 
    Error, 
    BulkDeleteTestRunsVariables, 
    { previousTestRuns: TestRunQueryResult | undefined }
  >({
    mutationFn: async ({ projectId, runIds }) => {
      const startTime = performance.now();
      logger.debug('Bulk deleting test runs', { projectId, runIds, count: runIds.length });
      
      try {
        // Use Promise.all to delete multiple test runs in parallel
        await Promise.all(
          runIds.map(runId => apiClient.deleteTestRun(projectId, runId))
        );
        
        const duration = Math.round(performance.now() - startTime);
        logger.debug('Test runs bulk deleted successfully', { 
          projectId, 
          count: runIds.length,
          duration: `${duration}ms`
        });
      } catch (error) {
        const duration = Math.round(performance.now() - startTime);
        const networkError = isNetworkError(error);
        
        logger.error('Failed to bulk delete test runs', { 
          projectId, 
          runIds,
          count: runIds.length,
          duration: `${duration}ms`,
          isNetworkError: networkError,
          error: error instanceof Error ? error.message : String(error)
        });
        
        if (networkError) {
          throw new TestRunError(
            'Network error: Please check your connection and try again',
            'NETWORK_ERROR'
          );
        }
        
        throw error instanceof Error 
          ? new TestRunError(error.message)
          : new TestRunError('Failed to bulk delete test runs');
      }
    },
    onMutate: async ({ projectId, runIds }) => {
      await queryClient.cancelQueries({ queryKey: ['testRuns', projectId] });
      const previousTestRuns = queryClient.getQueryData<TestRunQueryResult>(['testRuns', projectId]);

      // Optimistically remove the test runs from the list
      queryClient.setQueryData<TestRunQueryResult | undefined>(
        ['testRuns', projectId],
        (old) => old && {
          ...old,
          items: old.items.filter(run => !runIds.includes(run.id)),
          total: old.total - runIds.length,
        }
      );

      return { previousTestRuns };
    },
    onError: (error, variables, context) => {
      if (context?.previousTestRuns) {
        queryClient.setQueryData(['testRuns', variables.projectId], context.previousTestRuns);
      }
      if (showToasts) {
        let errorMessage = 'Failed to delete test runs';
        
        if (error instanceof TestRunError) {
          switch (error.code) {
            case 'NETWORK_ERROR':
              errorMessage = error.message;
              break;
            default:
              errorMessage = `Failed to delete test runs: ${error.message}`;
          }
        } else if (error instanceof Error) {
          errorMessage = `Failed to delete test runs: ${error.message}`;
        }
        
        toast.error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['testRuns', variables.projectId] });
      
      // Also remove the specific test runs from cache
      variables.runIds.forEach(runId => {
        queryClient.removeQueries({ queryKey: ['testRun', variables.projectId, runId] });
      });
      
      if (showToasts) {
        const count = variables.runIds.length;
        toast.success(`${count} test ${count === 1 ? 'run' : 'runs'} deleted successfully`);
      }
    },
  });
}

interface TestRunOptions {
  enabled?: boolean;
  retry?: boolean | number;
  staleTime?: number;
  showToasts?: boolean;
}

export function useTestRun(
  projectId: string | undefined,
  runId: string | undefined,
  options: TestRunOptions = {}
): UseQueryResult<TestRun, Error> {
  return useQuery<TestRun, Error>({
    queryKey: ['testRun', projectId, runId],
    queryFn: async () => {
      if (!projectId || !runId) {
        throw new TestRunError(
          'Project ID and Test Run ID are required',
          'MISSING_PARAMETERS'
        );
      }
      
      const startTime = performance.now();
      logger.debug('Fetching test run details', { projectId, runId });
      
      try {
        const result = await apiClient.getTestRun(projectId, runId);
        
        const duration = Math.round(performance.now() - startTime);
        logger.debug('Test run details fetched successfully', { 
          projectId, 
          runId,
          duration: `${duration}ms`
        });
        
        return result;
      } catch (error) {
        const duration = Math.round(performance.now() - startTime);
        const networkError = isNetworkError(error);
        
        logger.error('Failed to fetch test run details', { 
          projectId, 
          runId,
          duration: `${duration}ms`,
          isNetworkError: networkError,
          error: error instanceof Error ? error.message : String(error)
        });
        
        if (networkError) {
          throw new TestRunError(
            'Network error: Please check your connection and try again',
            'NETWORK_ERROR'
          );
        }
        
        // Handle not found errors
        if (error instanceof Error && error.message.includes('not found')) {
          throw new TestRunError(
            'Test run not found or you don\'t have access to it',
            'NOT_FOUND'
          );
        }
        
        throw error instanceof Error 
          ? new TestRunError(error.message)
          : new TestRunError('Failed to fetch test run');
      }
    },
    enabled: !!projectId && !!runId && (options.enabled ?? true),
    retry: options.retry ?? 3,
    retryDelay: getRetryDelay,
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateTestRun(
  projectId: string,
  options: { showToasts?: boolean } = {}
): UseMutationResult<TestRun, Error, UpdateTestRunVariables, { previousTestRun: TestRun | undefined }> {
  const queryClient = useQueryClient();
  const showToasts = options.showToasts ?? true;
  
  return useMutation<TestRun, Error, UpdateTestRunVariables, { previousTestRun: TestRun | undefined }>({
    mutationFn: async ({ runId, status, testCaseResults }) => {
      const startTime = performance.now();
      logger.debug('Updating test run', { 
        projectId, 
        runId, 
        status, 
        resultCount: testCaseResults.length 
      });
      
      try {
        const result = await apiClient.updateTestRun(projectId, runId, {
          status,
          testCaseResults,
        });
        
        const duration = Math.round(performance.now() - startTime);
        logger.debug('Test run updated successfully', { 
          projectId, 
          runId,
          duration: `${duration}ms`
        });
        
        return result;
      } catch (error) {
        const duration = Math.round(performance.now() - startTime);
        const networkError = isNetworkError(error);
        
        logger.error('Failed to update test run', { 
          projectId, 
          runId,
          status,
          duration: `${duration}ms`,
          isNetworkError: networkError,
          error: error instanceof Error ? error.message : String(error)
        });
        
        if (networkError) {
          throw new TestRunError(
            'Network error: Please check your connection and try again',
            'NETWORK_ERROR'
          );
        }
        
        // Handle validation errors
        if (error instanceof Error && error.message.includes('validation')) {
          throw new TestRunError(
            'Invalid test run data: Please check your inputs',
            'VALIDATION_ERROR'
          );
        }
        
        // Handle not found errors
        if (error instanceof Error && error.message.includes('not found')) {
          throw new TestRunError(
            'Test run not found or you don\'t have access to it',
            'NOT_FOUND'
          );
        }
        
        throw error instanceof Error 
          ? new TestRunError(error.message)
          : new TestRunError('Failed to update test run');
      }
    },
    onMutate: async ({ runId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['testRun', projectId, runId] });
      const previousTestRun = queryClient.getQueryData<TestRun>(['testRun', projectId, runId]);
      
      // Optimistically update the test run
      if (previousTestRun) {
        const now = new Date().toISOString();
        
        // Create an updated test run for optimistic update
        const optimisticTestRun = {
          ...previousTestRun,
          status,
          updatedAt: now,
        };
        
        queryClient.setQueryData<TestRun>(
          ['testRun', projectId, runId],
          (optimisticTestRun as unknown) as TestRun
        );
        
        // Also update the test run in the list if it exists
        queryClient.setQueriesData<TestRunQueryResult>(
          { queryKey: ['testRuns', projectId] },
          (old) => {
            if (!old) return old;
            
            return {
              ...old,
              items: old.items.map(run => 
                run.id === runId 
                  ? { ...run, status, updatedAt: now } as unknown as TestRun
                  : run
              )
            };
          }
        );
      }
      
      return { previousTestRun };
    },
    onError: (error, variables, context) => {
      if (context?.previousTestRun) {
        queryClient.setQueryData(['testRun', projectId, variables.runId], context.previousTestRun);
        
        // Also revert the test run in the list if it exists
        queryClient.setQueriesData<TestRunQueryResult>(
          { queryKey: ['testRuns', projectId] },
          (old) => {
            if (!old) return old;
            
            return {
              ...old,
              items: old.items.map(run => 
                run.id === variables.runId && context.previousTestRun
                  ? { ...run, status: context.previousTestRun.status, updatedAt: context.previousTestRun.updatedAt } as unknown as TestRun
                  : run
              )
            };
          }
        );
      }
      
      if (showToasts) {
        let errorMessage = 'Failed to update test run';
        
        if (error instanceof TestRunError) {
          switch (error.code) {
            case 'NETWORK_ERROR':
              errorMessage = error.message;
              break;
            case 'VALIDATION_ERROR':
              errorMessage = error.message;
              break;
            case 'NOT_FOUND':
              errorMessage = error.message;
              break;
            default:
              errorMessage = `Failed to update test run: ${error.message}`;
          }
        } else if (error instanceof Error) {
          errorMessage = `Failed to update test run: ${error.message}`;
        }
        
        toast.error(errorMessage);
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['testRun', projectId, variables.runId],
      });
      queryClient.invalidateQueries({ 
        queryKey: ['testRuns', projectId] 
      });
      if (showToasts) {
        toast.success('Test run updated successfully');
      }
    },
  });
}
