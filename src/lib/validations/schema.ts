import { z } from 'zod';
import { TestRunStatus, TestResultStatus } from '@/types/testRun';

// Base schemas for reuse
export const idSchema = z.string().uuid();
export const dateSchema = z.date().or(z.string().datetime());

// Common response schemas
export const errorSchema = z.object({
  error: z.string(),
  details: z.any().optional(),
});

// Test Run schemas
export const testRunSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.nativeEnum(TestRunStatus),
  projectId: idSchema,
  startedAt: dateSchema.optional(),
  completedAt: dateSchema.optional(),
});

export const testResultSchema = z.object({
  testCaseId: idSchema,
  status: z.nativeEnum(TestResultStatus),
  notes: z.string().optional(),
});

// API Input/Output schemas
export const executeTestRunInputSchema = z.object({
  results: z.array(testResultSchema),
});

// Type inference
export type TestRunInput = z.infer<typeof testRunSchema>;
export type TestResultInput = z.infer<typeof testResultSchema>; 