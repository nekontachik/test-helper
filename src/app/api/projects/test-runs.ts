import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiErrorHandler } from '@/lib/apiErrorHandler';
import logger from '@/lib/logger';
import { AppError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [testRuns, totalCount] = await Promise.all([
      prisma.testRun.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.testRun.count(),
    ]);

    logger.info('Retrieved test runs', { page, limit });
    return NextResponse.json({
      items: testRuns,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
    });
  } catch (error) {
    logger.error('Error in test runs handler:', error);
    return apiErrorHandler(error);
  }
}
