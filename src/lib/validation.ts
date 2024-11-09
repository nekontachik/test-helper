import { z } from 'zod';
import { TestCaseStatus, TestCasePriority } from '@/types';

const testCaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  steps: z.string().min(1, 'Steps are required'),
  expectedResult: z.string().min(1, 'Expected result is required'),
  status: z.nativeEnum(TestCaseStatus),
  priority: z.nativeEnum(TestCasePriority),
  projectId: z.string().uuid()
});

export const testSuiteSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  testCaseIds: z.array(z.string().uuid()).optional()
});

export const testRunSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  testCaseIds: z.array(z.string().uuid()).min(1, 'At least one test case is required')
});

export async function validateTestCase(data: unknown) {
  return testCaseSchema.parseAsync(data);
}
