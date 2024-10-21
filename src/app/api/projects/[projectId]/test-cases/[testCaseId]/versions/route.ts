import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string; testCaseId: string } }
) {
  const { testCaseId } = params;

  try {
    const testCaseVersions = await prisma.testCaseVersion.findMany({
      where: { testCaseId },
      orderBy: { versionNumber: 'desc' },
      select: { versionNumber: true },
    });

    if (!testCaseVersions.length) {
      return NextResponse.json({ error: 'No versions found for this test case' }, { status: 404 });
    }

    const versions = testCaseVersions.map((v) => v.versionNumber);

    return NextResponse.json(versions);
  } catch (error) {
    console.error('Error fetching test case versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test case versions' },
      { status: 500 }
    );
  }
}
