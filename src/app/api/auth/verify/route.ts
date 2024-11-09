import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AUTH_ERRORS } from '@/lib/utils/error';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: AUTH_ERRORS.INVALID_TOKEN },
        { status: 400 }
      );
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: AUTH_ERRORS.INVALID_TOKEN },
        { status: 400 }
      );
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { 
          identifier_token: {
            identifier: verificationToken.identifier,
            token: verificationToken.token
          }
        }
      });
      return NextResponse.json(
        { error: AUTH_ERRORS.TOKEN_EXPIRED },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { email: verificationToken.identifier },
        data: { emailVerified: new Date() }
      }),
      prisma.verificationToken.delete({
        where: { 
          identifier_token: {
            identifier: verificationToken.identifier,
            token: verificationToken.token
          }
        }
      })
    ]);

    return NextResponse.redirect(new URL('/auth/signin', request.url));
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: AUTH_ERRORS.UNKNOWN },
      { status: 500 }
    );
  }
}
