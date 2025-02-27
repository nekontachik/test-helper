import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { getApiDocs } from '@/lib/api/swagger';

export async function GET(_req: NextRequest): Promise<ApiResponse<unknown>> {
  return NextResponse.json(getApiDocs()); } 