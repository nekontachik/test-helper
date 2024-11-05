import type { Session } from 'next-auth';
import type { NextRequest } from 'next/server';
import type { AuthUser } from '@/lib/auth/types';

export interface RequestWithSession extends Request {
  session?: Session;
}

export interface RequestWithUser extends Request {
  user: AuthUser;
  url: string;
} 