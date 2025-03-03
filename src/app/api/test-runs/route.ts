import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/withAuth';
import type { AuthenticatedRequest } from '@/lib/auth/withAuth';
import { TestRunService } from '@/lib/services/report/testRunService';
import { ApiErrorHandler } from '@/lib/utils/apiErrorHandler';
import type { PrismaClient } from '@prisma/client';
import { protect } from '@/lib/auth/protect';
import { logger } from '@/lib/logger';

// Validation schemas
const createTestRunSchema = z.object({
  projectId: z.string(),
  testCaseIds: z.array(z.string()).min(1),
  title: z.string().optional() });

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await createTestRunSchema.parseAsync(await req.json());
    
    const result = await prisma.$transaction(async (tx: PrismaClient['$transaction']) => {
      return TestRunService.createTestRun(tx, {
        ...body,
        userId: req.user.id });
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

async function getTestRuns(
  req: NextRequest,
  { session, params }: { session: any; params: Record<string, string> }
) {
  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    const where = projectId ? { projectId } : {};
    
    const [testRuns, total] = await Promise.all([
      prisma.testRun.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          project: {
            select: {
              name: true
            }
          }
        }
      }),
      prisma.testRun.count({ where })
    ]);
    
    return NextResponse.json({
      testRuns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching test runs', { error });
    return NextResponse.json(
      { error: 'Failed to fetch test runs' },
      { status: 500 }
    );
  }
}

export const GET = protect(getTestRuns, {
  roles: ['ADMIN', 'MANAGER', 'EDITOR', 'TESTER'],
  requireVerified: true,
  rateLimit: { points: 100, duration: 60 },
  audit: true,
  auditAction: 'TEST_RUN_LIST_VIEW'
}); 