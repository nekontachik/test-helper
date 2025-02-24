import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/withAuth';
import type { AuthenticatedRequest } from '@/lib/auth/withAuth';
import { TestRunService } from '@/lib/services/report/testRunService';
import { TEST_RESULT_STATUS } from '@/lib/services/report/constants';
import { ApiErrorHandler } from '@/lib/utils/apiErrorHandler';

// Validation schemas
const createTestRunSchema = z.object({
  projectId: z.string(),
  testCaseIds: z.array(z.string()).min(1),
  title: z.string().optional()
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await createTestRunSchema.parseAsync(await req.json());
    
    const result = await prisma.$transaction(async (tx) => {
      return TestRunService.createTestRun(tx, {
        ...body,
        userId: req.user.id
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