import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SecurityService } from '@/lib/auth/securityService';
import { z } from 'zod';

const securitySettingsSchema = z.object({
  twoFactorEnabled: z.boolean().optional(),
  sessionTimeout: z.number().min(5).max(60).optional(), // minutes
  allowMultipleSessions: z.boolean().optional() });

export async function GET(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401); }

    const settings = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        twoFactorEnabled: true,
        failedLoginAttempts: true,
        lockedUntil: true,
        sessions: {
          select: {
            id: true,
            lastActive: true,
            userAgent: true,
            ipAddress: true },
          where: {
            expiresAt: {
              gt: new Date() } } } } });

    return createSuccessResponse({
      ...settings,
      activeSessions: settings?.sessions.length ?? 0 }; } catch (error) {
    console.error('Security settings fetch error:', error);
    return createErrorResponse('Failed to fetch security settings', 'ERROR_CODE', 500); }
}

export async function PUT(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401); }

    const body = await _req.json();
    const settings = securitySettingsSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: settings,
      select: {
        twoFactorEnabled: true,
        updatedAt: true, } });

    return NextResponse.json(updatedUser); } catch (error) {
    console.error('Security settings update error:', error);
    return createErrorResponse('Failed to update security settings', 'ERROR_CODE', 500); }
}
