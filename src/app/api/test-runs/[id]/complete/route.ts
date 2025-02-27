import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/withAuth';
import type { AuthenticatedRequest } from '@/lib/auth/withAuth';
import { TestRunService } from '@/lib/services/report/testRunService';
import { ApiErrorHandler } from '@/lib/utils/apiErrorHandler';
import type { PrismaClient } from '@prisma/client';

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

    const result = await prisma.$transaction(async (tx: PrismaClient['$transaction']) => {
      return TestRunService.completeTestRun(tx, id);
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