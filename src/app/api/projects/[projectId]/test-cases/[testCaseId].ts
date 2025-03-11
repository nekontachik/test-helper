import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/apiErrorHandler';
import { logger } from '@/lib/logger';
import { NotFoundError } from '@/lib/errors';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; testCaseId: string } }
): Promise<Response> {
  try {
    const testCase = await prisma.testCase.findUnique({
      where: {
        id: params.testCaseId,
        projectId: params.projectId,
      },
    });

    if (!testCase) {
      throw new NotFoundError('Test case not found');
    }

    return NextResponse.json(testCase);
  } catch (error) {
    logger.error('Error in test case handler:', error);
    return handleApiError(error);
  }
}
