import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { AuthenticatedRequest } from '@/lib/auth/withAuth';
import { createTestRun } from '@/lib/services/testRunService';
import { protect } from '@/lib/auth/protect';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/api/errorHandler';

// Validation schemas
const createTestRunSchema = z.object({
  projectId: z.string(),
  testCaseIds: z.array(z.string()).min(1),
  title: z.string().optional() });

// @ts-expect-error - The protect function expects NextRequest but we're using AuthenticatedRequest
export const POST = protect(async (req: AuthenticatedRequest) => {
  try {
    const body = await createTestRunSchema.parseAsync(await req.json());
    
    // Create an input object with required properties
    const input: {
      projectId: string;
      testCaseIds: string[];
      userId: string;
      title: string;
      environment: string;
    } = {
      projectId: body.projectId,
      testCaseIds: body.testCaseIds,
      userId: req.user.id,
      title: body.title || 'Untitled Test Run', // Provide default title
      environment: 'production' // Default environment
    };
    
    const result = await createTestRun(input);

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

async function getTestRuns(
  req: NextRequest,
  _context: { 
    params: Record<string, string>;
    session: unknown;
  }
): Promise<NextResponse> {
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

// @ts-expect-error - The protect function expects NextRequest but we're using a custom handler
export const GET = protect(getTestRuns, {
  roles: ['ADMIN', 'MANAGER', 'EDITOR', 'TESTER'],
  requireVerified: true,
  rateLimit: { points: 100, duration: 60 },
  audit: true,
  auditAction: 'TEST_RUN_LIST_VIEW'
}); 