# Error Categories

## API Route Errors (Missing Modules/Types)
1. Missing '@lib/auth' module:
   - src/app/api/projects/[projectId]/test-cases/[testCaseId]/restore/route.ts:4
   - src/app/api/projects/[projectId]/test-cases/[testCaseId]/route.ts:4

2. Missing '@lib/apiErrorHandler' module:
   - src/app/api/projects/test-runs.ts:2

3. Property does not exist on PrismaClient:
   - src/app/api/projects/[projectId]/test-cases/route.ts:52 (testCase)
   - src/app/api/projects/[projectId]/test-runs/route.ts:3 (testRun)
   - src/app/api/projects/[projectId]/test-reports/route.ts:3 (testReport)

## Test File Errors (Missing Test Dependencies)
1. Missing test utilities:
   - tests/components/ErrorBoundary.test.tsx:3
   - tests/components/ProjectCard.test.tsx:7
   - tests/components/ProjectForm.test.tsx:4
   - tests/components/TestCaseDetails.test.tsx:3

2. Missing test mocks:
   - src/app/api/projects/[projectId]/test-cases/__tests__/route.test.ts:3
   - src/app/api/projects/[projectId]/test-reports/__tests__/route.test.ts:3
   - src/app/api/projects/[projectId]/test-runs/__tests__/route.test.ts:3

## Component Errors (Type/Props Issues)
1. Props validation errors:
   - src/components/CreateProjectForm.tsx:39
   - src/components/EditProjectForm.tsx:30
   - src/components/TestCaseList.tsx:3
   - src/components/TestCaseVersionHistory.tsx:37

2. Story type errors:
   - src/components/TestRunForm.stories.tsx:16

## Hook Errors (Missing Dependencies)
1. Missing hook dependencies:
   - src/hooks/useProjects.ts:4
   - tests/hooks/useApi.test.ts:2
   - tests/hooks/useErrorHandler.test.ts:2
   - tests/hooks/useLogger.test.ts:2

## Page Component Errors
1. Missing page dependencies:
   - src/app/projects/[projectId]/test-cases/[testCaseId]/page.tsx:6
   - src/app/projects/[projectId]/test-cases/create/page.tsx:7
   - src/app/projects/page.tsx:22

## Integration Test Errors
1. Missing test utilities:
   - tests/integration/createAndExecuteTestRun.test.tsx:7
   - tests/integration/createProject.test.tsx:5
   - tests/integration/createTestCase.test.tsx:6
   - tests/integration/editTestCase.test.tsx:5

## Validation Errors
1. Missing validation utilities:
   - src/lib/__tests__/validation.test.ts:1
