import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { TestRunStatus, TestCaseResultStatus } from '@/types';
import { dbLogger as logger } from '@/lib/logger';

const testRunResultSchema = z.object({
  testCaseId: z.string(),
  status: z.enum([
    TestCaseResultStatus.PASSED,
    TestCaseResultStatus.FAILED,
    TestCaseResultStatus.BLOCKED,
    TestCaseResultStatus.SKIPPED
  ]),
  notes: z.string().optional(),
  evidenceUrls: z.array(z.string()).optional(),
});

const executeTestRunSchema = z.object({
  results: z.array(testRunResultSchema),
});

// Add type for parsed result
interface ParsedTestResult {
  testCaseId: string;
  status: TestCaseResultStatus;
  notes?: string;
  evidenceUrls?: string[];
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string; testRunId: string } }
) {
  try {
    const body = await req.json();
    const { results } = executeTestRunSchema.parse(body) as { results: ParsedTestResult[] };

    // Calculate overall status using correct enum values
    const hasFailures = results.some(r => r.status === TestCaseResultStatus.FAILED);
    const hasBlocked = results.some(r => r.status === TestCaseResultStatus.BLOCKED);
    const allSkipped = results.every(r => r.status === TestCaseResultStatus.SKIPPED);
    
    let finalStatus = TestRunStatus.COMPLETED;
    if (hasFailures) finalStatus = TestRunStatus.FAILED;
    else if (hasBlocked) finalStatus = TestRunStatus.BLOCKED;
    else if (allSkipped) finalStatus = TestRunStatus.SKIPPED;

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update test run status
      const updatedRun = await tx.testRun.update({
        where: { id: params.testRunId },
        data: { 
          status: finalStatus,
          completedAt: new Date()
        }
      });

      // Create test results with correct schema
      const testResults = await Promise.all(results.map((result) =>
        tx.testCaseResult.create({
          data: {
            testCaseId: result.testCaseId,
            testRunId: params.testRunId,
            status: result.status,
            notes: result.notes ?? '',
            evidenceUrls: result.evidenceUrls ? JSON.stringify(result.evidenceUrls) : null,
            completedAt: new Date()
          }
        })
      ));

      return { run: updatedRun, results: testResults };
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Error executing test run:', error);
    return NextResponse.json(
      { error: 'Failed to execute test run' },
      { status: 500 }
    );
  }
} 