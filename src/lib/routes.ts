export const ROUTES = {
  PROJECT: {
    INDEX: (projectId: string) => `/projects/${projectId}`,
    TEST_RUNS: {
      INDEX: (projectId: string) => `/projects/${projectId}/test-runs`,
      SHOW: (projectId: string, runId: string) =>
        `/projects/${projectId}/test-runs/${runId}`,
      TEST_CASES: (projectId: string, runId: string) =>
        `/projects/${projectId}/test-runs/${runId}/test-cases`,
      EXPORT: (projectId: string, runId: string) =>
        `/projects/${projectId}/test-runs/${runId}/export`,
    },
    TEST_CASES: {
      INDEX: (projectId: string) => `/projects/${projectId}/test-cases`,
      SHOW: (projectId: string, caseId: string) =>
        `/projects/${projectId}/test-cases/${caseId}`,
    },
    TEST_REPORTS: {
      INDEX: (projectId: string) => `/projects/${projectId}/test-reports`,
      SHOW: (projectId: string, reportId: string) =>
        `/projects/${projectId}/test-reports/${reportId}`,
    }
  },
  API: {
    PROJECT: {
      INDEX: (projectId: string) => `/api/projects/${projectId}`,
      TEST_RUNS: {
        INDEX: (projectId: string) => `/api/projects/${projectId}/test-runs`,
        SHOW: (projectId: string, runId: string) =>
          `/api/projects/${projectId}/test-runs/${runId}`,
      },
      TEST_CASES: {
        INDEX: (projectId: string) => `/api/projects/${projectId}/test-cases`,
        SHOW: (projectId: string, caseId: string) =>
          `/api/projects/${projectId}/test-cases/${caseId}`,
      },
      TEST_REPORTS: {
        INDEX: (projectId: string) => `/api/projects/${projectId}/test-reports`,
        SHOW: (projectId: string, reportId: string) =>
          `/api/projects/${projectId}/test-reports/${reportId}`,
      }
    },
  }
};
