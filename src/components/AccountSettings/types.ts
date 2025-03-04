import type { AuthUser } from '@/lib/auth/types';
import type { UseFormRegister } from 'react-hook-form';
import type { z } from 'zod';
import type { profileSchema, passwordSchema } from './schemas';

export type ProfileFormData = z.infer<typeof profileSchema>;
export type PasswordFormData = z.infer<typeof passwordSchema>;

export interface AccountSettingsProps {
  user: AuthUser;
}

export interface PasswordInputWrapperProps {
  register: UseFormRegister<PasswordFormData>;
  name: keyof PasswordFormData;
  placeholder: string;
  value: string;
}

// Re-export constants for convenience
export { API_ENDPOINTS } from './constants'; 