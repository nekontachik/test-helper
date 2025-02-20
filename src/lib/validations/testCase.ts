import { z } from 'zod';
import { TestCaseStatus, TestCasePriority } from '@/types';

export const testCaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  steps: z.string().min(1, 'Steps are required'),
  expectedResult: z.string().min(1, 'Expected result is required'),
  actualResult: z.string().optional(),
  status: z.nativeEnum(TestCaseStatus),
  priority: z.nativeEnum(TestCasePriority),
  projectId: z.string().uuid()
});

export type TestCaseFormData = z.infer<typeof testCaseSchema>; 