import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/withAuth';
import type { AuthenticatedRequest } from '@/lib/auth/withAuth';
import { TestRunService } from '@/lib/services/report/testRunService';
import { TEST_RESULT_STATUS } from '@/lib/services/report/constants';
import { ApiErrorHandler } from '@/lib/utils/apiErrorHandler';

const executeTestRunSchema = z.object({
  results: z.array(z.object({
    testCaseId: z.string(),
    status: z.enum([
      TEST_RESULT_STATUS.PASSED,
      TEST_RESULT_STATUS.FAILED,
      TEST_RESULT_STATUS.SKIPPED
    ]),
    notes: z.string().max(1000).optional()
  })).optional()
});

interface RouteParams {
  params: { id: string };
}

export const POST = withAuth(async (req: AuthenticatedRequest, { params }: RouteParams) => {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Test run ID is required' } },
        { status: 400 }
      );
    }

    const body = await executeTestRunSchema.parseAsync(await req.json());
    
    const result = await prisma.$transaction(async (tx) => {
      return TestRunService.executeTestRun(tx, {
        testRunId: id,
        userId: req.user.id,
        results: body.results
      });
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}); 