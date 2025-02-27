import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { OwnershipService } from '@/lib/auth/ownership/service';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  steps: z.string().optional(),
  expectedResult: z.string().optional(),
  priority: z.string().optional() });

export async function PUT(
  _req: NextRequest,
  { params }: { params: { testCaseId: string } }
): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

    const isOwner = await OwnershipService.isTestCaseOwner(
      session.user.id,
      params.testCaseId
    );

    if (!isOwner) {
      return createErrorResponse('You do not have permission to update this test case', 'FORBIDDEN', 403);
    }

    const body = await _req.json();
    const data = updateSchema.parse(body);

    const updatedTestCase = await prisma.testCase.update({
      where: { id: params.testCaseId },
      data });

    return createSuccessResponse(updatedTestCase);
  } catch (error) {
    console.error('Test case update error:', error);
    return createErrorResponse('Failed to update test case', 'INTERNAL_ERROR', 500);
  }
}
