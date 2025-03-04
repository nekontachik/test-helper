export const API_ENDPOINTS = {
  UPDATE_PROFILE: '/api/auth/update-profile',
  CHANGE_PASSWORD: '/api/auth/change-password',
} as const;

export const ERROR_MESSAGES = {
  PROFILE_UPDATE_FAILED: 'Failed to update profile. Please try again.',
  PASSWORD_CHANGE_FAILED: 'Failed to change password. Please try again.',
  INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action.',
} as const; 