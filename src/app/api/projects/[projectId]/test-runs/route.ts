import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { testRunSchema } from '@/lib/validation';
import { TestRunStatus } from '@/types';
import { logger } from '@/lib/logger';
import { createEndpoint } from '@/lib/api/createEndpoint';

export async function GET(
  _req: NextRequest, 
  { params }: { params: { projectId: string } }
): Promise<ApiResponse<unknown>> {
  const session = await getServerSession(authOptions);
  const { projectId } = params;

  if (!session?.user) {
    return createErrorResponse("Unauthorized", "UNAUTHORIZED", 401);
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
      orderBy: { createdAt: 'desc' } 
    });

    return createSuccessResponse(testRuns);
  } catch (error) {
    logger.error("Error fetching test runs:", error);
    return createErrorResponse("Internal Server Error", "SERVER_ERROR", 500);
  }
}

export const POST = createEndpoint({
  method: 'POST',
  schema: testRunSchema,
  handler: async (data: { name: string; testCaseIds: string[] }) => {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    try {
      // Extract projectId from the URL or context if needed
      // For now, assuming it's available in the request context
      const projectId = ""; // This would be populated from context

      const testRun = await prisma.testRun.create({
        data: {
          ...data,
          projectId, // Use the projectId from context
          status: TestRunStatus.PENDING,
          userId: session.user.id,
        },
        include: {
          testRunCases: true,
        }
      });

      return testRun;
    } catch (error) {
      logger.error("Error creating test run:", error);
      throw new Error("Invalid test run data");
    }
  }
});
