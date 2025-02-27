import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/utils/hashPassword';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    logger.debug('Signup API - Request received:', { 
      hasName: !!name, 
      hasEmail: !!email 
    });

    if (!name || !email || !password) {
      return createErrorResponse('Missing required fields', 'VALIDATION_ERROR', 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return createErrorResponse('User already exists', 'USER_EXISTS', 409);
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
      }
    });

    logger.info('Signup API - User created successfully:', { 
      userId: user.id,
      email: user.email 
    });

    return createSuccessResponse({ success: true, user });
  } catch (error) {
    logger.error('Signup API - Error:', error);
    return createErrorResponse('Internal Server Error', 'SERVER_ERROR', 500);
  }
}
