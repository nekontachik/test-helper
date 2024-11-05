// 1. Rate Limiting Enhancement
export const rateLimitConfig = {
  auth: {
    points: 5,
    duration: '5m',
    blockDuration: '15m'
  },
  password: {
    points: 3,
    duration: '1h',
    blockDuration: '24h'
  }
}

// 2. Session Management
export const sessionConfig = {
  cleanup: {
    interval: '1h',
    maxAge: '30d'
  },
  tracking: {
    enabled: true,
    maxDevices: 5
  }
}

// 3. Password Security
export const passwordConfig = {
  minLength: 12,
  maxLength: 128,
  checkBreached: true,
  requireMixedCase: true,
  requireNumbers: true,
  requireSymbols: true
} 