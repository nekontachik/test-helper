import { z } from 'zod';

// Define test result status as a const enum
export const TEST_RESULT_STATUS = {
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  BLOCKED: 'BLOCKED',
  SKIPPED: 'SKIPPED'
} as const;

// Schema for test execution input
export const executeTestSchema = z.object({
  testCaseId: z.string(),
  status: z.enum(['PASSED', 'FAILED', 'BLOCKED', 'SKIPPED']),
  notes: z.string().optional().default(''),
  evidence: z.array(z.string().url()).optional().default([])
});

// Type inference from the schema
export type ExecuteTestInput = z.infer<typeof executeTestSchema>;

// Schema for test result creation
export const testResultSchema = executeTestSchema.extend({
  testRunId: z.string(),
  executedById: z.string()
});

// Type inference for the full test result
export type TestResult = z.infer<typeof testResultSchema>;

export type TestResultFormData = z.infer<typeof testResultSchema>;

export const testResultResponseSchema = z.object({
  id: z.string(),
  testCaseId: z.string(),
  status: z.enum(['PASSED', 'FAILED', 'BLOCKED', 'SKIPPED']),
  notes: z.string().optional(),
  evidence: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TestResultResponse = z.infer<typeof testResultResponseSchema>; 