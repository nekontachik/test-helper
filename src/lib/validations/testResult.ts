import { z } from 'zod';
import { TestResultStatus } from '@/types';

export const testResultSchema = z.object({
  testCaseId: z.string(),
  status: z.nativeEnum(TestResultStatus),
  notes: z.string().optional(),
  evidenceUrls: z.array(z.string()).optional()
});

export type TestResultFormData = z.infer<typeof testResultSchema>;

export const testResultResponseSchema = z.object({
  id: z.string(),
  testCaseId: z.string(),
  status: z.nativeEnum(TestResultStatus),
  notes: z.string().optional(),
  evidenceUrls: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TestResultResponse = z.infer<typeof testResultResponseSchema>; 