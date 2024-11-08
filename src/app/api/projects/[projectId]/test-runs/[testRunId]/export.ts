import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiErrorHandler } from '@/lib/apiErrorHandler';
import logger from '@/lib/logger';
import type { TestCase } from '@prisma/client';

interface TestRunWithCases {
  id: string;
  name: string;
  status: string;
  testRunCases: Array<{
    testCase: TestCase;
  }>;
}

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; testRunId: string } }
) {
  try {
    const testRun = await prisma.testRun.findUnique({
      where: {
        id: String(params.testRunId),
        projectId: String(params.projectId),
      },
      include: {
        testRunCases: {
          include: {
            testCase: true
          }
        }
      },
    }) as TestRunWithCases | null;

    if (!testRun) {
      return NextResponse.json({ error: 'Test run not found' }, { status: 404 });
    }

    const exportData = {
      id: testRun.id,
      name: testRun.name,
      status: testRun.status,
      testCases: testRun.testRunCases.map(({ testCase }) => ({
        id: testCase.id,
        title: testCase.title,
        status: testCase.status,
      })),
    };

    logger.info(`Exported test run data: ${testRun.id}`);
    return NextResponse.json(exportData);
  } catch (error) {
    logger.error('Error exporting test run:', error);
    return apiErrorHandler(error);
  }
}
