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

export async function validateTestCase(data: unknown) {
  return testCaseSchema.parseAsync(data);
}
