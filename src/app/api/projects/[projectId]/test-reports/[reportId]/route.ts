import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import logger from '@/lib/logger';
import { AppError, ValidationError, NotFoundError } from '@/lib/errors';

interface UpdateTestReportBody {
  title: string;
  content?: string;
}

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; reportId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const testReport = await prisma.testReport.findUnique({
      where: { id: params.reportId },
      select: {
        id: true,
        title: true,
        content: true,
        projectId: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!testReport) {
      throw new NotFoundError('Test report not found');
    }

    if (testReport.projectId !== params.projectId) {
      throw new AppError('Test report does not belong to this project', 403);
    }

    return NextResponse.json(testReport);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { projectId: string; reportId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const body = await request.json() as UpdateTestReportBody;
    const { projectId, reportId } = params;

    const existingReport = await prisma.testReport.findUnique({
      where: { id: reportId },
    });

    if (!existingReport) {
      throw new NotFoundError('Test report not found');
    }

    if (existingReport.projectId !== projectId) {
      throw new AppError('Test report does not belong to this project', 403);
    }

    const updatedReport = await prisma.testReport.update({
      where: { id: reportId },
      data: body,
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string; reportId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const { projectId, reportId } = params;

    const existingReport = await prisma.testReport.findUnique({
      where: { id: reportId },
    });

    if (!existingReport) {
      throw new NotFoundError('Test report not found');
    }

    if (existingReport.projectId !== projectId) {
      throw new AppError('Test report does not belong to this project', 403);
    }

    await prisma.testReport.delete({
      where: { id: reportId },
    });

    return NextResponse.json({ message: 'Test report deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}