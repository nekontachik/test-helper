import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { protect } from '@/lib/auth/protect';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/api/errorHandler';
import type { AuthenticatedRequest } from '@/lib/auth/withAuth';

// Validation schema for test result submission
const testResultSchema = z.object({
  testCaseId: z.string(),
  status: z.enum(['PASSED', 'FAILED', 'BLOCKED', 'SKIPPED']),
  notes: z.string().optional(),
  evidence: z.string().optional(),
});

// @ts-expect-error - The protect function expects NextRequest but we're using AuthenticatedRequest
export const POST = protect(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const testRunId = params.id;
    const body = await testResultSchema.parseAsync(await req.json());
    
    // Check if the test run exists and is in progress
    const testRun = await prisma.testRun.findUnique({
      where: { id: testRunId },
    });
    
    if (!testRun) {
      return NextResponse.json(
        { error: 'Test run not found' },
        { status: 404 }
      );
    }
    
    if (testRun.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Test run is not in progress' },
        { status: 400 }
      );
    }
    
    // Check if the test case exists and belongs to the test run
    const testRunCase = await prisma.testRunCase.findFirst({
      where: {
        testRunId,
        testCaseId: body.testCaseId,
      },
    });
    
    if (!testRunCase) {
      return NextResponse.json(
        { error: 'Test case not found in this test run' },
        { status: 404 }
      );
    }
    
    // Create or update the test result
    const existingResult = await prisma.testCaseResult.findFirst({
      where: {
        testRunId,
        testCaseId: body.testCaseId,
      },
    });
    
    let testResult;
    
    if (existingResult) {
      // Update existing result
      testResult = await prisma.testCaseResult.update({
        where: { id: existingResult.id },
        data: {
          status: body.status,
          notes: body.notes || null,
          evidence: body.evidence || '',
          executedById: req.user.id,
          executedAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new result
      testResult = await prisma.testCaseResult.create({
        data: {
          testRunId,
          testCaseId: body.testCaseId,
          status: body.status,
          notes: body.notes || null,
          evidence: body.evidence || '',
          executedById: req.user.id,
          executedAt: new Date(),
        },
      });
    }
    
    // Update the test run case status
    await prisma.testRunCase.update({
      where: { id: testRunCase.id },
      data: {
        status: body.status,
        updatedAt: new Date(),
      },
    });
    
    logger.info(`Test result submitted for test case ${body.testCaseId} in test run ${testRunId}`, {
      userId: req.user.id,
      testRunId,
      testCaseId: body.testCaseId,
      status: body.status,
    });
    
    return NextResponse.json(testResult);
  } catch (error) {
    return handleApiError(error);
  }
}); 