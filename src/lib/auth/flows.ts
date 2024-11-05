// 1. Password Reset
export const passwordResetConfig = {
  tokenExpiry: '1h',
  maxAttempts: 3,
  cooldown: '24h'
}

// 2. Email Verification
export const emailVerificationConfig = {
  tokenExpiry: '24h',
  requireReauth: true
}

// 3. Account Management
export const accountConfig = {
  deletionDelay: '14d',
  lockoutThreshold: 5,
  lockoutDuration: '1h'
} 