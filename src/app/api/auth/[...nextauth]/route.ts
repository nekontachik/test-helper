import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { apiLogger } from '@/lib/logger';

const handler = NextAuth(authOptions);

// Export only GET and POST handlers as required by NextAuth
export const GET = handler;
export const POST = handler;
