/**
 * API Documentation
 * 
 * Base URL: /api
 * 
 * Test Cases
 * ----------
 * GET    /projects/:projectId/test-cases
 * POST   /projects/:projectId/test-cases
 * GET    /test-cases/:id
 * PATCH  /test-cases/:id
 * DELETE /test-cases/:id
 * 
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 10)
 * - search: string
 * - status: TestCaseStatus[]
 * - priority: TestCasePriority[]
 */

import type { TestCase, TestCaseStatus, TestCasePriority } from '@/types/testCase';

export interface ApiEndpoints {
  testCases: {
    list: {
      method: 'GET';
      path: '/projects/:projectId/test-cases';
      params: {
        projectId: string;
        page?: number;
        limit?: number;
        search?: string;
        status?: TestCaseStatus[];
        priority?: TestCasePriority[];
      };
      response: {
        items: TestCase[];
        totalPages: number;
        currentPage: number;
      };
    };
    create: {
      method: 'POST';
      path: '/projects/:projectId/test-cases';
      body: Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>;
      response: TestCase;
    };
    get: {
      method: 'GET';
      path: '/test-cases/:id';
      params: { id: string };
      response: TestCase;
    };
    update: {
      method: 'PATCH';
      path: '/test-cases/:id';
      params: { id: string };
      body: Partial<TestCase>;
      response: TestCase;
    };
    delete: {
      method: 'DELETE';
      path: '/test-cases/:id';
      params: { id: string };
      response: void;
    };
  };
} 