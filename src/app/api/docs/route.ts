import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getApiDocs } from '@/lib/api/swagger';

export async function GET(_req: NextRequest): Promise<Response> {
  return NextResponse.json(getApiDocs());
} 