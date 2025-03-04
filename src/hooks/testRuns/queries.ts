import { useQuery } from '@tanstack/react-query';
import type { TestRun as _TestRun, PaginatedResponse as _PaginatedResponse } from '../../types';
import apiClient from '../../lib/apiClient';
import logger from '../../lib/utils/logger';
import type { TestRunsOptions, TestRunOptions, TestRunQueryResult } from './types';
import { TestRunError } from './types';
import { isNetworkError } from './utils';

/**
 * Hook to fetch a list of test runs for a project
 */
export function useTestRuns(
  projectId: string,
  page = 1,
  limit = 10,
  options: TestRunsOptions = {}
): ReturnType<typeof useQuery> {
  const { filters, enabled = true, staleTime, retry } = options;
  
  return useQuery({
    queryKey: ['testRuns', projectId, page, limit, filters],
    queryFn: async () => {
      const startTime = performance.now();
      logger.debug('Fetching test runs', { projectId, page, limit, filters });
      
      try {
        const apiResponse = await apiClient.getTestRuns(projectId, {
          page,
          limit,
          ...filters
        });
        
        const duration = Math.round(performance.now() - startTime);
        logger.debug('Test runs fetched successfully', { 
          projectId, 
          count: apiResponse.data.length,
          total: apiResponse.total,
          duration: `${duration}ms`
        });
        
        const result: TestRunQueryResult = {
          items: apiResponse.data,
          total: apiResponse.total,
          page: apiResponse.page || page,
          limit: apiResponse.limit || limit,
          totalPages: apiResponse.totalPages || Math.ceil(apiResponse.total / limit)
        };
        
        return result;
      } catch (error) {
        const duration = Math.round(performance.now() - startTime);
        const networkError = isNetworkError(error);
        
        logger.error('Failed to fetch test runs', { 
          projectId, 
          page, 
          limit,
          filters,
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
            'Project not found or you don\'t have access to it',
            'NOT_FOUND'
          );
        }
        
        throw error instanceof Error 
          ? new TestRunError(error.message)
          : new TestRunError('Failed to fetch test runs');
      }
    },
    enabled,
    staleTime,
    retry
  });
}

/**
 * Hook to fetch a single test run by ID
 */
export function useTestRun(
  projectId: string,
  runId: string,
  options: TestRunOptions = {}
): ReturnType<typeof useQuery> {
  const { enabled = true, staleTime, retry } = options;
  
  return useQuery({
    queryKey: ['testRun', projectId, runId],
    queryFn: async () => {
      const startTime = performance.now();
      logger.debug('Fetching test run', { projectId, runId });
      
      try {
        const result = await apiClient.getTestRun(projectId, runId);
        
        const duration = Math.round(performance.now() - startTime);
        logger.debug('Test run fetched successfully', { 
          projectId, 
          runId,
          duration: `${duration}ms`
        });
        
        return result;
      } catch (error) {
        const duration = Math.round(performance.now() - startTime);
        const networkError = isNetworkError(error);
        
        logger.error('Failed to fetch test run', { 
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
    enabled,
    staleTime,
    retry
  });
} 