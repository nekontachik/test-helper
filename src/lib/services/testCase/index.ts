// Re-export types
export * from './types';

// Re-export functions from modules
export { createTestCase, bulkCreateTestCases } from './create';
export { updateTestCase } from './update';
export { getTestCaseVersions, restoreTestCaseVersion } from './versions';

// Export a default object with all functions for convenience
import { createTestCase, bulkCreateTestCases } from './create';
import { updateTestCase } from './update';
import { getTestCaseVersions, restoreTestCaseVersion } from './versions';

const testCaseService = {
  createTestCase,
  bulkCreateTestCases,
  updateTestCase,
  getTestCaseVersions,
  restoreTestCaseVersion
};

export default testCaseService; 