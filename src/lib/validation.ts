import { z } from 'zod';
import { TestCaseStatus, TestCasePriority, TestRunStatus } from '@/types';

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters'),
  description: z
    .string()
    .max(1000, 'Project description must be less than 1000 characters')
    .optional()
    .nullable(),
  status: z
    .enum(['ACTIVE', 'COMPLETED', 'ARCHIVED'])
    .default('ACTIVE'),
});

export const testCaseSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  steps: z
    .string()
    .min(1, 'Steps are required'),
  expectedResult: z
    .string()
    .min(1, 'Expected result is required'),
  actualResult: z
    .string()
    .optional(),
  status: z.nativeEnum(TestCaseStatus),
  priority: z.nativeEnum(TestCasePriority),
  projectId: z.string().min(1, 'Project ID is required'),
});

export const testRunSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  status: z.nativeEnum(TestRunStatus),
  projectId: z.string().min(1, 'Project ID is required'),
  testCaseIds: z.array(z.string()).min(1, 'At least one test case is required'),
});

export const testSuiteSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(1000).optional(),
  testCaseIds: z.array(z.string()).optional(),
});

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
});

export const testRunNoteSchema = z.object({
  content: z.string()
    .min(1, 'Note content cannot be empty')
    .max(2000, 'Note content must be less than 2000 characters'), // Updated max length
});

export const testCaseAttachmentSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
  fileSize: z.number().min(1, 'File size must be greater than 0'),
  url: z.string().url('Invalid URL'),
});

export type ProjectSchemaType = z.infer<typeof projectSchema>;
export type TestCaseSchemaType = z.infer<typeof testCaseSchema>;
export type TestRunSchemaType = z.infer<typeof testRunSchema>;
export type TestSuiteFormData = z.infer<typeof testSuiteSchema>;
export type CommentFormData = z.infer<typeof commentSchema>;
export type TestRunNoteFormData = z.infer<typeof testRunNoteSchema>;
export type TestCaseAttachmentFormData = z.infer<typeof testCaseAttachmentSchema>;
