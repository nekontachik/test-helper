import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TestRunStatus, TestCaseResultStatus } from '@/types';

export async function PUT(
  request: Request,
  { params }: { params: { projectId: string; testRunId: string } }
) {
  try {
    const { projectId, testRunId } = params;
    const { status, testCaseResults } = await request.json();

    const updatedTestRun = await prisma.testRun.update({
      where: { id: testRunId },
      data: {
        status: status as TestRunStatus,
        testCaseResults: {
          create: testCaseResults.map((result: any) => ({
            status: result.status as TestCaseResultStatus,
            notes: result.notes,
            testCase: { connect: { id: result.testCaseId } },
          })),
        },
      },
      include: {
        testCases: true,
        testCaseResults: true,
      },
    });

    return NextResponse.json(updatedTestRun);
  } catch (error) {
    console.error('Error updating test run:', error);
    return NextResponse.json(
      { error: 'Failed to update test run' },
      { status: 500 }
    );
  }
}
