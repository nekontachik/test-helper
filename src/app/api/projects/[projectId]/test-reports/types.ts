import type { PrismaClient } from '@prisma/client';

// Define TestReport interface
export interface TestReport {
  id: string;
  title: string;
  content: string;
  projectId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

// Define transaction client type
export type TransactionClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

// Define session type
export interface UserSession {
  user: {
    id: string;
    [key: string]: unknown;
  };
} 