import { NextResponse } from 'next/server';
import { PasswordPolicyService } from '@/lib/auth/passwordPolicy';
import { z } from 'zod';

const validateSchema = z.object({
  password: z.string(),
  context: z.object({
    email: z.string().email().optional(),
    name: z.string().optional(),
  }).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password, context } = validateSchema.parse(body);

    const result = await PasswordPolicyService.validatePassword(password, context);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Password validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate password' },
      { status: 500 }
    );
  }
} 