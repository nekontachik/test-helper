import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { dbLogger as logger } from '@/lib/logger';
import { TestCaseResultStatus } from '@/types';
import type { Prisma } from '@prisma/client';

const resultSchema = z.object({
  testCaseId: z.string(),
  status: z.nativeEnum(TestCaseResultStatus),
  notes: z.string().optional(),
  evidenceUrls: z.array(z.string()).optional() });

export async function POST(
  _req: NextRequest,
  { params }: { params: { projectId: string; runId: string; testRunId: string } }
): Promise<ApiResponse<unknown>> {
  try {
    const { results } = await z.object({ results: z.array(resultSchema) }).parseAsync(await _req.json());

    const status = results.some(r => r.status === TestCaseResultStatus.FAILED) ? 'failed'
      : results.every(r => r.status === TestCaseResultStatus.SKIPPED) ? 'skipped'
      : 'completed';

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const run = await tx.testRun.update({
        where: { id: params.testRunId },
        data: { status, completedAt: new Date() } });

      const testResults = await tx.testCaseResult.createMany({
        data: results.map(r => ({
          testCaseId: r.testCaseId,
          testRunId: params.testRunId,
          status: r.status,
          notes: r.notes ?? '',
          evidenceUrls: r.evidenceUrls ? JSON.stringify(r.evidenceUrls) : null,
          completedAt: new Date() })) });

      return { run, results: testResults }; });

    return createSuccessResponse(result);
  } catch (error) {
    logger.error('Error executing test run:', error);
    return createErrorResponse('Failed to execute test run', 'INTERNAL_ERROR');
  }
}
