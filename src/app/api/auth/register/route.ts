import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { SecurityService } from '@/lib/auth/securityService';
import { sendVerificationEmail } from '@/lib/emailService';
import { AUTH_ERRORS } from '@/lib/utils/error';
import logger from '@/lib/logger';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: AUTH_ERRORS.USER_EXISTS },
        { status: 400 }
      );
    }

    // Check if password has been breached
    const isBreached = await SecurityService.checkPasswordBreached(password);
    if (isBreached) {
      return NextResponse.json(
        { error: AUTH_ERRORS.PASSWORD_COMPROMISED },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await SecurityService.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Send verification email
    await sendVerificationEmail(email, name);

    logger.info('User registered successfully', { userId: user.id });
    return NextResponse.json(
      {
        message: 'Registration successful',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Registration error:', error);
    return NextResponse.json(
      { error: AUTH_ERRORS.UNKNOWN },
      { status: 500 }
    );
  }
}
