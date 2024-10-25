import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface TestReportInput {
  title: string;
  content: string;
}

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;

  try {
    const testReports = await prisma.testReport.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(testReports);
  } catch (error) {
    console.error('Error fetching test reports:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;
  const body = await request.json() as TestReportInput;

  try {
    const newTestReport = await prisma.testReport.create({
      data: {
        title: body.title,
        content: body.content,
        project: {
          connect: { id: projectId }
        }
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(newTestReport, { status: 201 });
  } catch (error) {
    console.error('Error creating test report:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
