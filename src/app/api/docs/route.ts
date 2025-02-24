import { getApiDocs } from '@/lib/api/swagger';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(getApiDocs());
} 