import { NextResponse } from 'next/server';
import logger from '@/lib/utils/logger';

export async function GET(_request: Request): Promise<Response> {
  const requestId = crypto.randomUUID();
  logger.debug('[TEST-PAGE] Direct access route handler', { requestId });
  
  // Instead of NextResponse.next(), return a successful response
  return NextResponse.json(
    { success: true, message: 'Test page access allowed' },
    { status: 200 }
  );
} 