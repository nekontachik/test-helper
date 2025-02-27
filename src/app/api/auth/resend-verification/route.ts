import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/emailService';
import { z } from 'zod';

const emailSchema = z.object({
  email: z.string().email() });

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const body = await _req.json();
    const { email } = emailSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, emailVerified: true } });

    if (!user) {
      return createErrorResponse('User not found', 'ERROR_CODE', 404); }

    if (user.emailVerified) {
      return createErrorResponse('Email already verified', 'ERROR_CODE', 400); }

    await sendVerificationEmail(user.email, user.name || 'User');

    return createSuccessResponse({
      message: 'Verification email sent successfully' }; } catch (error) {
    console.error('Resend verification error:', error);
    return createErrorResponse('Failed to send verification email', 'ERROR_CODE', 500); }
}
