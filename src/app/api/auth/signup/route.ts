import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/utils/hashPassword';
import { logger } from '@/lib/utils/logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    logger.debug('Signup API - Request received:', { 
      hasName: !!name, 
      hasEmail: !!email 
    });

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
      },
    });

    logger.info('Signup API - User created successfully:', { 
      userId: user.id,
      email: user.email 
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    logger.error('Signup API - Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 