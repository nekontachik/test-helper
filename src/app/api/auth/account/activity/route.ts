import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { checkRateLimit } from '@/lib/auth/rateLimit';

export async function GET(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    // Check rate limit
    const ip = _req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(`account_activity_${ip}`);

    if (!rateLimitResult.success) {
      return createErrorResponse('Too many requests', 'ERROR_CODE', 429); }

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401); }

    // Get user's recent activity using the correct model name
    const activities = await prisma.userActivity.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        details: true, } });

    return NextResponse.json(activities); } catch (error) {
    console.error('Activity log error:', error);
    return createErrorResponse('Failed to fetch activity log', 'ERROR_CODE', 500); }
}

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401); }

    const body = await _req.json();
    const { type, details } = body;

    // Log new activity using the correct model name
    const activity = await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type,
        details: typeof details === 'string' ? details : JSON.stringify(details),
        ipAddress: _req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: _req.headers.get('user-agent') || 'unknown', } });

    return NextResponse.json(activity); } catch (error) {
    console.error('Activity logging error:', error);
    return createErrorResponse('Failed to log activity', 'ERROR_CODE', 500); }
}
