import { type NextRequest } from 'next/server';
import { createSuccessResponse, type ApiResponse, createErrorResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';
import { RateLimiter } from '@/lib/rate-limit/RateLimiter';

const rateLimiter = new RateLimiter();

interface TestRunCase {
  testCase: {
    id: string;
    title: string;
    status: string;
  };
}

interface TestRunWithRelations {
  id: string;
  name: string;
  status: string;
  projectId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  testRunCases: TestRunCase[];
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  project: {
    id: string;
    name: string;
  };
}

// Custom error handler that returns ApiResponse
function handleApiError(error: unknown): ApiResponse<unknown> {
  logger.error('API Error:', error);
  return createErrorResponse('An error occurred while processing your request');
}

export async function GET(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const ip = _req.headers.get('x-forwarded-for') || 'unknown';
    await rateLimiter.checkLimit(ip, { points: 100, duration: 60 });

    const url = new URL(_req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [testRuns, totalCount] = await Promise.all([
      prisma.testRun.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          testRunCases: {
            include: {
              testCase: {
                select: {
                  id: true,
                  title: true,
                  status: true } } } },
          user: {
            select: {
              id: true,
              name: true,
              email: true } },
          project: {
            select: {
              id: true,
              name: true } } } }),
      prisma.testRun.count()
    ]);

    logger.info('Retrieved test runs', { page, limit });
    
    const formattedTestRuns = testRuns.map((run: TestRunWithRelations) => ({
      ...run,
      testCases: run.testRunCases.map((trc: TestRunCase) => trc.testCase) }));

    return createSuccessResponse({
      items: formattedTestRuns,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      }
    });
  } catch (error) {
    logger.error('Error in test runs handler:', error);
    return handleApiError(error);
  }
}

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const ip = _req.headers.get('x-forwarded-for') || 'unknown';
    await rateLimiter.checkLimit(ip, { points: 50, duration: 60 });

    const body = await _req.json();
    const testRun = await prisma.testRun.create({
      data: {
        ...body,
        testRunCases: {
          create: body.testCaseIds?.map((testCaseId: string) => ({
            testCase: {
              connect: { id: testCaseId } } })) || [] } },
      include: {
        testRunCases: {
          include: {
            testCase: {
              select: {
                id: true,
                title: true,
                status: true } } } },
        user: {
          select: {
            id: true,
            name: true,
            email: true } },
        project: {
          select: {
            id: true,
            name: true } } } });

    const formattedTestRun = {
      ...testRun,
      testCases: testRun.testRunCases.map((trc: TestRunCase) => trc.testCase) };

    logger.info('Created test run', { runId: testRun.id });
    
    return createSuccessResponse(formattedTestRun);
  } catch (error) {
    logger.error('Error creating test run:', error);
    return handleApiError(error);
  }
}
