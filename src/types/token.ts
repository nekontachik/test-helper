export enum TokenType {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  TWO_FACTOR = 'TWO_FACTOR'
}

export interface TokenPayload {
  userId: string;
  email: string;
  type: TokenType;
  metadata?: Record<string, unknown>;
} 