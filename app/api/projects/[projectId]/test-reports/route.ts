import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { TestReport } from '@/types';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;

  try {
    const testReports = await prisma.testReport.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
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
  const body = await request.json();

  try {
    const newTestReport = await prisma.testReport.create({
      data: {
        ...body,
        projectId,
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
