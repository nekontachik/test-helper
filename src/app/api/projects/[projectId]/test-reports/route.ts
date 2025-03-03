import type { NextResponse } from 'next/server';
import { handleGET } from './handlers/get';
import { handlePOST } from './handlers/post';

// Export the handlers directly
export const GET = (req: Request): Promise<NextResponse> => handleGET(req);
export const POST = (req: Request): Promise<NextResponse> => handlePOST(req);
