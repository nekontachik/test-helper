export const ROUTES = {
  PROJECT: {
    INDEX: (projectId: string) => `/projects/${projectId}`,
    TEST_RUNS: {
      INDEX: (projectId: string) => `/projects/${projectId}/test-runs`,
      SHOW: (projectId: string, testRunId: string) =>
        `/projects/${projectId}/test-runs/${testRunId}`,
      TEST_CASES: (projectId: string, testRunId: string) =>
        `/projects/${projectId}/test-runs/${testRunId}/test-cases`,
      EXPORT: (projectId: string, testRunId: string) =>
        `/projects/${projectId}/test-runs/${testRunId}/export`,
      EXECUTE: (projectId: string, testRunId: string) =>
        `/projects/${projectId}/test-runs/${testRunId}/execute`,
    },
    TEST_CASES: {
      INDEX: (projectId: string) => `/projects/${projectId}/test-cases`,
      SHOW: (projectId: string, testCaseId: string) =>
        `/projects/${projectId}/test-cases/${testCaseId}`,
    },
  },
  API: {
    PROJECT: {
      INDEX: (projectId: string) => `/api/projects/${projectId}`,
      TEST_RUNS: {
        INDEX: (projectId: string) => `/api/projects/${projectId}/test-runs`,
        SHOW: (projectId: string, testRunId: string) =>
          `/api/projects/${projectId}/test-runs/${testRunId}`,
        TEST_CASES: (projectId: string, testRunId: string) =>
          `/api/projects/${projectId}/test-runs/${testRunId}/test-cases`,
        EXPORT: (projectId: string, testRunId: string) =>
          `/api/projects/${projectId}/test-runs/${testRunId}/export`,
      },
      TEST_CASES: {
        INDEX: (projectId: string) => `/api/projects/${projectId}/test-cases`,
        SHOW: (projectId: string, testCaseId: string) =>
          `/api/projects/${projectId}/test-cases/${testCaseId}`,
      },
    },
  },
};
