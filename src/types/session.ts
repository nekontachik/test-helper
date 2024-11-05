export interface SessionCleanupConfig {
  interval: number; // in milliseconds
  maxAge: number; // in milliseconds
}

export interface SessionWhereInput {
  expiresAt: {
    lt: Date;
  };
} 