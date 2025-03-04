import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { TestResultStatus } from '@/types/testRun';
import logger from '@/lib/logger';
import { isError } from '@/lib/utils/typeGuards';

const executeTestCaseSchema = z.object({
  testCaseId: z.string().uuid(),
  status: z.enum([
    TestResultStatus.PASSED,
    TestResultStatus.FAILED,
    TestResultStatus.SKIPPED,
    TestResultStatus.BLOCKED
  ]),
  notes: z.string().optional(),
  evidence: z.array(z.string().url()).optional()
});

export async function POST(
  req: NextRequest, 
  { params }: { params: { projectId: string; runId: string } }
): Promise<Response> {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = executeTestCaseSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;
    
    // Execute the test case in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get the test run
      const testRun = await tx.testRun.findUnique({
        where: {
          id: params.runId,
          projectId: params.projectId
        },
        include: {
          testRunCases: true
        }
      });

      if (!testRun) {
        throw new Error('Test run not found');
      }

      // If test run is in PENDING state, update it to IN_PROGRESS
      if (testRun.status === 'PENDING') {
        await tx.testRun.update({
          where: { id: params.runId },
          data: { 
            status: 'IN_PROGRESS',
            startTime: new Date()
          }
        });
      }

      // Create or update test result
      const testResult = await tx.testCaseResult.create({
        data: {
          testCaseId: validatedData.testCaseId,
          testRunId: params.runId,
          status: validatedData.status,
          // Convert undefined to null for optional fields
          notes: validatedData.notes || null,
          executedById: session.user.id,
          executedAt: new Date(),
          // Handle evidence properly
          evidence: validatedData.evidence ? JSON.stringify(validatedData.evidence) : ''
        }
      });

      // Check if all test cases have results
      const totalTestCases = testRun.testRunCases.length;
      const completedResults = await tx.testCaseResult.count({
        where: { 
          testRunId: params.runId 
        }
      });

      // Update test run status if all cases are completed
      if (completedResults >= totalTestCases) {
        // Check if any test cases failed
        const failedResults = await tx.testCaseResult.count({
          where: { 
            testRunId: params.runId,
            status: 'FAILED'
          }
        });

        const newStatus = failedResults > 0 ? 'FAILED' : 'PASSED';
        
        await tx.testRun.update({
          where: { id: params.runId },
          data: {
            status: newStatus,
            completedAt: new Date()
          }
        });
      }

      return testResult;
    });

    logger.info(`Test case ${validatedData.testCaseId} executed with status ${validatedData.status}`);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    logger.error('Error executing test case:', error);
    return NextResponse.json(
      { 
        error: 'Failed to execute test case', 
        details: isError(error) ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
