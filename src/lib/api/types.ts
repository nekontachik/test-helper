import type { NextResponse } from 'next/server';
import type { Session } from 'next-auth';

export interface RouteParams {
  params: Record<string, string>;
  searchParams?: Record<string, string>;
}

export type ProtectedRouteHandler<T = unknown> = (
  req: Request, 
  session: Session, 
  params: RouteParams, 
  extra?: unknown
) => Promise<NextResponse<T>>;

export interface RouteConfig {
  action: string;
  resource: string;
  permissions?: string[];
}

export interface RouteContext {
  params: RouteParams;
  session: Session;
  extra?: unknown;
} 