import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/apiErrorHandler';
import { RateLimiter } from '@/lib/rate-limit/RateLimiter';
import logger from '@/lib/logger';
import type { Prisma } from '@prisma/client';

const rateLimiter = new RateLimiter();

export async function GET(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    await rateLimiter.checkLimit(ip, { points: 100, duration: 60 });

    const url = new URL(request.url);
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
                  status: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          project: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.testRun.count()
    ]);

    logger.info('Retrieved test runs', { page, limit });
    
    const formattedTestRuns = testRuns.map(run => ({
      ...run,
      testCases: run.testRunCases.map(trc => trc.testCase)
    }));

    return NextResponse.json({
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

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    await rateLimiter.checkLimit(ip, { points: 50, duration: 60 });

    const body = await request.json();
    const testRun = await prisma.testRun.create({
      data: {
        ...body,
        testRunCases: {
          create: body.testCaseIds?.map((testCaseId: string) => ({
            testCase: {
              connect: { id: testCaseId }
            }
          })) || []
        }
      },
      include: {
        testRunCases: {
          include: {
            testCase: {
              select: {
                id: true,
                title: true,
                status: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    const formattedTestRun = {
      ...testRun,
      testCases: testRun.testRunCases.map(trc => trc.testCase)
    };

    logger.info('Created test run', { testRunId: testRun.id });
    
    return NextResponse.json(formattedTestRun, { status: 201 });
  } catch (error) {
    logger.error('Error creating test run:', error);
    return handleApiError(error);
  }
} 