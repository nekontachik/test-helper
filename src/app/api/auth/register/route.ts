import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { RegisterData } from '@/types/auth';
import { sendVerificationEmail } from '@/lib/emailService';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['USER', 'TESTER']),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body) as RegisterData;

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        hashedPassword,
        role: validatedData.role,
      },
    });

    // Send verification email
    await sendVerificationEmail(user.email, user.name || 'User');

    const { hashedPassword: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        ...userWithoutPassword,
        message: 'Registration successful. Please check your email to verify your account.' 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
