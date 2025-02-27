import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { authUtils } from '@/lib/utils/authUtils';
import { prisma } from '@/lib/prisma';

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await authUtils.getSession();
    const body = await _req.json();

    const log = await prisma.activityLog.create({
      data: {
        type: 'ERROR',
        action: 'ERROR_BOUNDARY',
        userId: session?.user?.id || 'SYSTEM',
        metadata: JSON.stringify(body),
        ipAddress: _req.headers.get('x-forwarded-for') || _req.headers.get('x-real-ip'),
        userAgent: _req.headers.get('user-agent') 
      } 
    });

    return createSuccessResponse({ success: true, log });
  } catch (error) {
    console.error('Failed to log error:', error);
    return createErrorResponse('Failed to log error', 'LOG_ERROR', 500);
  }
}
