import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { testRunSchema } from '@/lib/validation';
import { TestRunStatus } from '@/types';
import { logger } from '@/lib/utils/logger';
import { createEndpoint } from '@/lib/api/createEndpoint';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await getServerSession(authOptions);
  const { projectId } = params;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const testRuns = await prisma.testRun.findMany({
      where: { 
        projectId,
        userId: session.user.id
      },
      include: {
        testRunCases: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(testRuns);
  } catch (error) {
    logger.error("Error fetching test runs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const POST = createEndpoint({
  method: 'POST',
  schema: testRunSchema,
  handler: async (data) => {
    const session = await getServerSession(authOptions);
    const { projectId } = data;

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    try {
      const testRun = await prisma.testRun.create({
        data: {
          ...data,
          status: TestRunStatus.PENDING,
          userId: session.user.id,
        },
        include: {
          testRunCases: true,
        },
      });

      return testRun;
    } catch (error) {
      logger.error("Error creating test run:", error);
      throw new Error("Invalid test run data");
    }
  }
});
