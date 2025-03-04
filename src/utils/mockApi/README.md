# Mock API Client

This module provides mock implementations of API endpoints for development and testing purposes. It simulates network delays and provides consistent response formats that match the real API.

## Features

- Simulated network delays for realistic testing
- Consistent API response format
- Mock data for projects, test runs, and test cases
- Full CRUD operations for all entities
- TypeScript type definitions

## Usage

```typescript
import { fetchProjects, createTestRun, fetchTestCases } from '@/utils/mockApi';

// Example: Fetch all projects
async function loadProjects() {
  const response = await fetchProjects();
  
  if (response.success) {
    // Handle successful response
    console.log('Projects:', response.data);
  } else {
    // Handle error
    console.error('Error:', response.error);
  }
}

// Example: Create a new test run
async function createNewTestRun(projectId: string) {
  const response = await createTestRun({
    name: 'New Test Run',
    description: 'Created from mock API',
    projectId,
    status: 'draft'
  });
  
  if (response.success) {
    // Handle successful response
    console.log('Created test run:', response.data);
  } else {
    // Handle error
    console.error('Error:', response.error);
  }
}
```

## API Response Format

All API functions return a Promise with a standardized response object:

```typescript
interface ApiResponse<T> {
  success: boolean;  // Whether the request was successful
  data?: T;          // Response data (if success is true)
  error?: string;    // Error message (if success is false)
}
```

## Available Functions

### Projects

- `fetchProjects()` - Get all projects
- `fetchProject(id)` - Get a project by ID
- `createProject(data)` - Create a new project
- `updateProject(id, data)` - Update an existing project

### Test Runs

- `fetchTestRuns()` - Get all test runs
- `fetchProjectTestRuns(projectId)` - Get test runs for a specific project
- `fetchTestRun(id)` - Get a test run by ID
- `createTestRun(data)` - Create a new test run
- `updateTestRun(id, data)` - Update an existing test run

### Test Cases

- `fetchTestCases(testRunId)` - Get test cases for a specific test run
- `fetchTestCase(testRunId, testCaseId)` - Get a test case by ID
- `createTestCase(testRunId, data)` - Create a new test case
- `updateTestCase(testRunId, testCaseId, data)` - Update an existing test case
- `deleteTestCase(testRunId, testCaseId)` - Delete a test case

## Utilities

- `simulateApiDelay(ms)` - Utility function to simulate network delay
- `logApiRequest(message, data)` - Utility function to log API requests 