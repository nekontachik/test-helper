import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

// Export only GET and POST handlers as required by NextAuth
export const GET = handler;
export const POST = handler;
