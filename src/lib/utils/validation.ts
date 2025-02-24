import type { TestCase } from '@/types';
import { z } from 'zod';

export const validators = {
  isValidTestCase(data: unknown): data is TestCase {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      steps: z.string().min(1),
      expectedResult: z.string().min(1),
      status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH'])
    });

    return schema.safeParse(data).success;
  }
};

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional()
});

export const createTestCaseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  steps: z.string().min(1),
  expectedResult: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED'])
}); 