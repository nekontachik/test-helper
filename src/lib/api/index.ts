import { cacheUtils } from './utils/cache';
import { projectsApi } from './endpoints/projectsApi';
import { testCasesApi } from './endpoints/testCasesApi';
import { testRunsApi } from './endpoints/testRunsApi';
import { authApi } from './endpoints/authApi';
import { testSuitesApi } from './endpoints/testSuitesApi';

/**
 * Main API client that combines all API modules
 */
const apiClient = {
  // Core HTTP methods
  cache: {
    clear: cacheUtils.clear,
    invalidate: cacheUtils.invalidate
  },
  
  // Domain-specific API endpoints
  projects: projectsApi,
  testCases: testCasesApi,
  testRuns: testRunsApi,
  auth: authApi,
  testSuites: testSuitesApi
};

export { apiClient };
export default apiClient;export default apiClient;
