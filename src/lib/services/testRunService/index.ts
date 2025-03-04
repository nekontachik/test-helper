/**
 * Test Run Service
 * 
 * This file serves as a facade for all test run related services.
 * It re-exports functionality from specialized service modules.
 */

// Re-export the TestRunService class
import { TestRunService } from './TestRunService';
export { TestRunService };

// Re-export creation service
export { createTestRun } from './testRunCreationService';

// Re-export execution service
export { executeTestRun } from './testRunExecutionService';

// Re-export query services
export { 
  getTestRunDetails,
  getTestRunsByProject,
  getTestRunSummary
} from './testRunQueryService';

// Re-export mappers
export {
  mapToTestRunWithCases,
  calculateTestRunSummary
} from './testRunMappers'; 