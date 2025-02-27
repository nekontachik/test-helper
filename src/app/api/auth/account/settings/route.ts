import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const settingsSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  notifications: z.boolean().optional(),
  language: z.string().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional() });

export async function GET(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401); }

    const settings = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        emailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true, } });

    return NextResponse.json(settings); } catch (error) {
    console.error('Settings fetch error:', error);
    return createErrorResponse('Failed to fetch settings', 'ERROR_CODE', 500); }
}

export async function PUT(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401); }

    const body = await _req.json();
    const settings = settingsSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: settings,
      select: {
        name: true,
        email: true,
        emailVerified: true,
        twoFactorEnabled: true,
        updatedAt: true, } });

    return NextResponse.json(updatedUser); } catch (error) {
    console.error('Settings update error:', error);
    return createErrorResponse('Failed to update settings', 'ERROR_CODE', 500); }
}
