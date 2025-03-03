import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { AuthenticatedRequest } from '@/lib/auth/withAuth';
import { executeTestRun } from '@/lib/services/testRunService';
import { TEST_RESULT_STATUS } from '@/lib/services/report/constants';
import { protect } from '@/lib/auth/protect';
import { handleApiError } from '@/lib/api/errorHandler';

// Define schema but mark as unused with underscore prefix
const _executeTestRunSchema = z.object({
  results: z.array(z.object({
    testCaseId: z.string(),
    status: z.enum([
      TEST_RESULT_STATUS.PASSED,
      TEST_RESULT_STATUS.FAILED,
      TEST_RESULT_STATUS.SKIPPED
    ]),
    notes: z.string().max(1000).optional() })).optional() });

interface RouteParams {
  params: { id: string };
}

// @ts-expect-error - The protect function expects NextRequest but we're using AuthenticatedRequest
export const POST = protect(async (req: AuthenticatedRequest, { params }: RouteParams) => {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Test run ID is required' } },
        { status: 400 }
      );
    }

    // For now, we're just executing the test run without results
    // The results will be added in a separate API call
    const result = await executeTestRun(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Unknown error' },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return handleApiError(error);
  }
}); 