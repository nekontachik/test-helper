import type { TestCase } from '@/types';
import { z } from 'zod';
import { TestCaseStatus, TestCasePriority } from '@/types';

export const TestCaseConstraints = {
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 2000,
  STEPS_MAX_LENGTH: 5000,
} as const;

export const testCaseSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(TestCaseConstraints.TITLE_MAX_LENGTH),
  description: z.string()
    .max(TestCaseConstraints.DESCRIPTION_MAX_LENGTH)
    .optional(),
  steps: z.string()
    .min(1, 'Steps are required')
    .max(TestCaseConstraints.STEPS_MAX_LENGTH),
  expectedResult: z.string()
    .min(1, 'Expected result is required'),
  priority: z.nativeEnum(TestCasePriority),
  status: z.nativeEnum(TestCaseStatus),
  projectId: z.string().uuid('Invalid project ID')
});

export const validators = {
  isValidTestCase(data: unknown): data is TestCase {
    return testCaseSchema.safeParse(data).success;
  }
};

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional()
});

export const createTestCaseSchema = testCaseSchema;
export const updateTestCaseSchema = testCaseSchema.partial(); 