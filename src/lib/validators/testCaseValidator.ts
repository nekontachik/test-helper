import { z } from 'zod';

export const TestCaseStatus = ['ACTIVE', 'DRAFT', 'ARCHIVED'] as const;
export const TestCasePriority = ['LOW', 'MEDIUM', 'HIGH'] as const;

export type TestCaseStatus = typeof TestCaseStatus[number];
export type TestCasePriority = typeof TestCasePriority[number];

export const testCaseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  steps: z.string().min(1),
  expectedResult: z.string().min(1),
  status: z.enum(TestCaseStatus),
  priority: z.enum(TestCasePriority),
  tags: z.array(z.string()).optional()
});

export type TestCaseInput = z.infer<typeof testCaseSchema>;

export const validateTestCase = (data: unknown): TestCaseInput => {
  return testCaseSchema.parse(data);
};

export const validatePartialTestCase = (data: unknown): Partial<TestCaseInput> => {
  return testCaseSchema.partial().parse(data);
}; 