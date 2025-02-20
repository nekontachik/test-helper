import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import logger from '@/lib/utils/logger';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      logger.warn('Unauthorized access attempt to credentials callback');
      return new NextResponse(null, { status: 401 });
    }

    logger.info('Successful credentials callback', { userId: session.user.id });
    return NextResponse.json({ 
      user: session.user,
      redirect: '/dashboard'
    });
  } catch (error) {
    logger.error('Error in credentials callback:', error);
    return new NextResponse(null, { status: 500 });
  }
} 