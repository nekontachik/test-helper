/**
 * Mock API Client
 * 
 * This module provides mock implementations of API endpoints for development and testing.
 * It simulates network delays and provides consistent response formats.
 */

// Export types
export * from './types';

// Export utility functions
export { simulateApiDelay, logApiRequest } from './utils';

// Export mock data
export { mockProjects, mockTestRuns, mockTestCases } from './mockData';

// Export API functions
export * from './projects';
export * from './testRuns';
export * from './testCases'; 