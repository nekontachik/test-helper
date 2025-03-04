# Test Case Service

This directory contains a modular implementation of the test case service, which provides functionality for managing test cases, including versioning, bulk operations, and more.

## Structure

The service is organized into the following modules:

- **index.ts**: Main entry point that exports all modules
- **types.ts**: Type definitions for test cases, inputs, and Prisma data
- **create.ts**: Functions for creating test cases (single and bulk)
- **update.ts**: Functions for updating test cases
- **versions.ts**: Functions for managing test case versions

## Usage

The service can be used by importing the specific functions or the default export:

```typescript
// Import specific functions
import { createTestCase, updateTestCase } from '@/lib/services/testCase';

// Or import the default object
import testCaseService from '@/lib/services/testCase';

// Example usage
const result = await testCaseService.createTestCase(projectId, testCaseData);
if (result.success) {
  const testCase = result.data;
  // Do something with the test case
} else {
  const error = result.error;
  // Handle the error
}
```

## Features

### Test Case Creation

- Single test case creation with validation
- Bulk test case creation
- Automatic versioning of test cases

### Test Case Updates

- Partial updates with validation
- Automatic versioning of changes

### Version Management

- Retrieving test case version history
- Restoring previous versions

## Error Handling

All functions return a `ServiceResponse` object that includes:

- `success`: Boolean indicating if the operation was successful
- `data`: The result data if successful
- `error`: Error information if unsuccessful 