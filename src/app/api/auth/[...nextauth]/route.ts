import NextAuth from 'next-auth';
import { authOptions } from '../config';

/**
 * NextAuth handler for authentication routes
 * This handles all authentication-related API routes under /api/auth/*
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
