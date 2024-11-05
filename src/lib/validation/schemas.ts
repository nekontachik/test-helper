import { z } from 'zod';

export const testCaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  steps: z.string().min(1, 'Steps are required'),
  expectedResult: z.string().min(1, 'Expected result is required'),
  status: z.enum(['DRAFT', 'ACTIVE', 'DEPRECATED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

export const createTestCaseSchema = testCaseSchema.extend({
  projectId: z.string().uuid('Invalid project ID')
});

export const updateTestCaseSchema = testCaseSchema.partial(); 