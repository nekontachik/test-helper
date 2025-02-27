import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { checkRateLimit } from '@/lib/auth/rateLimit';
import { UAParser } from 'ua-parser-js';
import { SessionTrackingService } from '@/lib/auth/sessionTrackingService';

export async function GET(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    // Check rate limit
    const ip = _req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(`session_activity_${ip}`);

    if (!rateLimitResult.success) {
      return createErrorResponse('Too many requests. Please try again later.', 'ERROR_CODE', 429); }

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401); }

    const activities = await prisma.session.findMany({
      where: { userId: session.user.id },
      orderBy: { lastActive: 'desc' },
      take: 10,
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        lastActive: true,
        expiresAt: true, } });

    const parser = new UAParser();
    const formattedActivities = activities.map(activity => {
      parser.setUA(activity.userAgent || '');
      const device = parser.getResult();

      return {
        ...activity,
        device: {
          browser: device.browser.name,
          os: device.os.name,
          device: device.device.type || 'desktop', },
        isExpired: activity.expiresAt < new Date() }; });

    return NextResponse.json(formattedActivities); } catch (error) {
    console.error('Session activity fetch error:', error);
    return createErrorResponse('Failed to fetch session activity', 'ERROR_CODE', 500); }
}

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401); }

    const body = await _req.json();
    const { sessionId } = body;

    await SessionTrackingService.trackSession({
      sessionId,
      userId: session.user.id,
      ip: _req.headers.get('x-forwarded-for') || undefined,
      userAgent: _req.headers.get('user-agent') || undefined });

    return createErrorResponse('Activity logged successfully'); } catch (error) {
    console.error('Session activity log error:', error);
    return createErrorResponse('Failed to log session activity', 'ERROR_CODE', 500); }
}
