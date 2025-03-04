import { z } from 'zod';

export interface TwoFactorSetupProps {
  onComplete: string;
  onError?: (error: Error) => void;
}

export type SetupStatus = 'initial' | 'configuring' | 'success' | 'error';

export interface VerifyResponse {
  success: boolean;
  error?: string;
  backupCodes?: string[];
}

export const verifySchema = z.object({
  code: z.string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d+$/, 'Code must contain only numbers')
    .transform((val) => val.trim())
    .refine((val) => !isNaN(parseInt(val, 10)), {
      message: 'Code must be numeric'
    })
});

export type FormValues = z.infer<typeof verifySchema>;

export const API_ENDPOINTS = {
  SETUP: '/api/auth/2fa/setup',
} as const;

export const ERROR_MESSAGES = {
  SETUP_FAILED: 'Failed to initiate 2FA setup',
  VERIFICATION_FAILED: 'Failed to verify 2FA code',
  INVALID_RESPONSE: 'Invalid server response',
} as const; 