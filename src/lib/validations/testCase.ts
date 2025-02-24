import { z } from 'zod';
import { TestCaseStatus, TestCasePriority } from '@/types/testCase';

export const testCaseStepSchema = z.object({
  order: z.number(),
  description: z.string().min(1, 'Step description is required'),
  expectedResult: z.string().min(1, 'Expected result is required'),
});

export const testCaseBaseSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  priority: z.nativeEnum(TestCasePriority),
  status: z.nativeEnum(TestCaseStatus).default(TestCaseStatus.DRAFT),
  steps: z.array(testCaseStepSchema).optional(),
  tags: z.array(z.string()).optional(),
  projectId: z.string().uuid(),
});

export const testCaseSchema = testCaseBaseSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createTestCaseSchema = testCaseBaseSchema;

export type TestCase = z.infer<typeof testCaseSchema>;
export type CreateTestCase = z.infer<typeof createTestCaseSchema>; 