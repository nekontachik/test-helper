import type { TestCase, TestCaseVersion, Prisma } from '@prisma/client';
import type { TestCaseInput, TestCaseUpdateInput } from '@/lib/validation/schemas';

// Re-export types from validation schemas
export type { TestCaseInput, TestCaseUpdateInput };
export type { TestCase, TestCaseVersion };

// Define the allowed status and priority values
export type TestCaseStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
export type TestCasePriority = 'LOW' | 'MEDIUM' | 'HIGH';

// Prisma input types
export type TestCasePrismaCreateInput = Prisma.TestCaseUncheckedCreateInput;
export type TestCasePrismaUpdateInput = Prisma.TestCaseUpdateInput;

// Version data type
export interface VersionData {
  testCaseId: string;
  versionNumber: number;
  changes: string;
  data: TestCaseInput;
  authorId: string;
} 