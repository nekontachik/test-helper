import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { projectId: string; testCaseId: string } }
) {
  const { projectId, testCaseId } = params;
  const { versionNumber } = await request.json();

  try {
    const versionToRestore = await prisma.testCaseVersion.findFirst({
      where: { testCaseId, versionNumber },
    });

    if (!versionToRestore) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    const restoredTestCase = await prisma.testCase.update({
      where: { id: testCaseId },
      data: {
        title: versionToRestore.title,
        description: versionToRestore.description,
        status: versionToRestore.status,
        priority: versionToRestore.priority,
        expectedResult: versionToRestore.expectedResult,
        version: versionToRestore.versionNumber, // Changed from 'version' to 'versionNumber'
      },
    });

    return NextResponse.json(restoredTestCase);
  } catch (error) {
    console.error('Error restoring test case version:', error);
    return NextResponse.json({ error: 'Failed to restore test case version' }, { status: 500 });
  }
}
