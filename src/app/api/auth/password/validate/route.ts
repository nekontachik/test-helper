import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { PasswordPolicyService } from '@/lib/auth/passwordPolicy';
import { z } from 'zod';

const validateSchema = z.object({
  password: z.string(),
  context: z.object({
    email: z.string().email().optional(),
    name: z.string().optional() }).optional() });

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const body = await _req.json();
    const { password, context } = validateSchema.parse(body);

    const result = await PasswordPolicyService.validatePassword(password, context);

    return createSuccessResponse(result);
  } catch (error) {
    console.error('Password validation error:', error);
    return createErrorResponse('Failed to validate password', 'ERROR_CODE', 500);
  }
}
