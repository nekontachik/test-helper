import { z } from 'zod';
import { TestCaseResultStatus } from '@/types';

export const testResultSchema = z.object({
  testCaseId: z.string().min(1, 'Test case ID is required'),
  status: z.nativeEnum(TestCaseResultStatus, {
    errorMap: () => ({ message: 'Please select a valid status' })
  }),
  notes: z.string().optional(),
  evidenceUrls: z.array(z.string().url('Invalid URL format')).optional(),
});

export type TestResultFormData = z.infer<typeof testResultSchema>;

export const testResultResponseSchema = z.object({
  id: z.string(),
  testCaseId: z.string(),
  status: z.nativeEnum(TestCaseResultStatus),
  notes: z.string().optional(),
  evidenceUrls: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TestResultResponse = z.infer<typeof testResultResponseSchema>; 