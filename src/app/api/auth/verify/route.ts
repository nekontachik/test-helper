import { NextResponse } from 'next/server';
import { validateVerificationToken } from '@/lib/tokens';
import { z } from 'zod';

const verifySchema = z.object({
  token: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = verifySchema.parse(body);

    const user = await validateVerificationToken(token);

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { message: 'Failed to verify email' },
      { status: 500 }
    );
  }
}
