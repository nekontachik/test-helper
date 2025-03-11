import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RBACService } from '@/lib/auth/rbac/service';
import { Action, Resource } from '@/types/rbac';
import type { SecureRouteContext, SecureRouteHandler } from '@/lib/api/createSecureRoute';
import { createSecureRoute } from '@/lib/api/createSecureRoute';
import { z } from 'zod';
import { logger } from '@/lib/logger';

// Define request schema
const updateTestCaseSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  steps: z.string().optional(),
  expectedResult: z.string().optional(),
  actualResult: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional() });

const handler: SecureRouteHandler = async (request: Request, context: SecureRouteContext) => {
  const { params, session } = context;
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const testCaseId = params?.testCaseId as string;

  try {
    // Get test case with project and team data
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
      include: {
        project: {
          include: {
            members: {
              select: {
                userId: true } } } } } });

    if (!testCase) {
      return NextResponse.json(
        { error: 'Test case not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const hasPermission = await RBACService.checkPermission(
      session.user.id,
      session.user.role,
      {
        action: Action.UPDATE,
        resource: Resource.TEST_CASE,
        resourceId: testCaseId }
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Validate request body
    const body = updateTestCaseSchema.parse(await request.json());

    // Update test case
    const updatedTestCase = await prisma.testCase.update({
      where: { id: testCaseId },
      data: body,
      include: {
        project: {
          select: {
            name: true,
            id: true } } } });

    logger.info('Test case updated', {
      testCaseId,
      userId: session.user.id,
      changes: body });

    return NextResponse.json(updatedTestCase);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Test case update error:', error);
    return NextResponse.json(
      { error: 'Failed to update test case' },
      { status: 500 }
    );
  }
};

// Export protected route handler
export const PUT = createSecureRoute(handler, {
  requireAuth: true,
  requireVerified: true,
  action: Action.UPDATE,
  resource: Resource.TEST_CASE,
  audit: {
    action: 'UPDATE_TEST_CASE',
    getMetadata: async (req) => ({
      ip: req.headers.get('x-forwarded-for'),
      userAgent: req.headers.get('user-agent') })
  }
}); 