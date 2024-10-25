import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiErrorHandler } from '@/lib/apiErrorHandler';
import logger from '@/lib/logger';

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
      include: { testCases: true },
    });

    if (!testRun) {
      return NextResponse.json({ error: 'Test run not found' }, { status: 404 });
    }

    const exportData = {
      id: testRun.id,
      name: testRun.name,
      status: testRun.status,
      testCases: testRun.testCases.map((tc) => ({
        id: tc.id,
        title: tc.title,
        status: tc.status,
      })),
    };

    logger.info(`Exported test run data: ${testRun.id}`);
    return NextResponse.json(exportData);
  } catch (error) {
    logger.error('Error exporting test run:', error);
    return apiErrorHandler(error, 'test run export handler');
  }
}
