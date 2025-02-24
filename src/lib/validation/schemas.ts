import { z } from 'zod';

// Common enums
export const TestCaseStatusEnum = z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']);
export const TestCasePriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);

// Export enum types
export type TestCaseStatus = z.infer<typeof TestCaseStatusEnum>;
export type TestCasePriority = z.infer<typeof TestCasePriorityEnum>;

// Base schemas
export const testCaseBaseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  steps: z.string().min(1),
  expectedResult: z.string().min(1),
  actualResult: z.string().optional(),
  status: TestCaseStatusEnum,
  priority: TestCasePriorityEnum,
});

// Input schemas
export const createTestCaseSchema = testCaseBaseSchema.extend({
  projectId: z.string().uuid(),
});

export const updateTestCaseSchema = testCaseBaseSchema.partial();

// Export types
export type TestCaseInput = z.infer<typeof createTestCaseSchema>;
export type TestCaseUpdateInput = z.infer<typeof updateTestCaseSchema>;

// Validation functions
export const validateTestCase = (data: unknown): TestCaseInput => {
  return createTestCaseSchema.parse(data);
};

export const validatePartialTestCase = (data: unknown): TestCaseUpdateInput => {
  return updateTestCaseSchema.parse(data);
}; 