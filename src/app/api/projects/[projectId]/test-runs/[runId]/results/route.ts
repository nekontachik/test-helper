import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { AppError, NotFoundError } from '@/lib/errors';
import logger from '@/lib/logger';

// Define a type for the test case result
interface TestCaseResultInput {
  testCaseId: string;
  status: string;
  output?: string;
  duration?: number;
  [key: string]: unknown;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { projectId: string; runId: string } }
): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession();
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const { projectId, runId } = params;

    const testCaseResults = await prisma.testCaseResult.findMany({
      where: { runId },
      include: { testCase: true }
    });

    if (!testCaseResults.length) {
      throw new NotFoundError('No test case results found for this test run');
    }

    logger.info(`Retrieved test case results for test run: ${runId}`, { projectId, runId });
    return createSuccessResponse(testCaseResults);
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`AppError in GET test case results: ${error.message}`, { statusCode: error.statusCode });
      return createErrorResponse(error.message, 'APP_ERROR', error.statusCode);
    }
    logger.error('Unexpected error in GET test case results:', error);
    return createErrorResponse('An unexpected error occurred', 'INTERNAL_ERROR', 500);
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { projectId: string; runId: string } }
): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession();
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const { projectId, runId } = params;
    const body = await _req.json();

    if (!Array.isArray(body.results)) {
      throw new AppError('Invalid request body', 400);
    }

    const createdResults = await prisma.testCaseResult.createMany({
      data: body.results.map((result: TestCaseResultInput) => ({
        ...result,
        runId
      }))
    });

    logger.info(`Created test case results for test run: ${runId}`, { projectId, runId, count: createdResults.count });
    return createSuccessResponse({ success: true, count: createdResults.count });
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`AppError in POST test case results: ${error.message}`, { statusCode: error.statusCode });
      return createErrorResponse(error.message, 'APP_ERROR', error.statusCode);
    }
    logger.error('Unexpected error in POST test case results:', error);
    return createErrorResponse('An unexpected error occurred', 'INTERNAL_ERROR', 500);
  }
}
