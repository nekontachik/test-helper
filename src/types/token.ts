export enum TokenType {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  RECOVERY = 'RECOVERY',
  API = 'API',
  TWO_FACTOR = 'TWO_FACTOR'
}

export interface TokenPayload {
  type: TokenType;
  userId: string;
  email: string;
  expiresIn?: string;
  [key: string]: unknown;
}

export interface TokenMetadata {
  type: TokenType;
  expiresIn: string;
  refreshable?: boolean;
}

export const TOKEN_CONFIG: Record<TokenType, TokenMetadata> = {
  [TokenType.ACCESS]: {
    type: TokenType.ACCESS,
    expiresIn: '15m',
    refreshable: true
  },
  [TokenType.REFRESH]: {
    type: TokenType.REFRESH,
    expiresIn: '7d'
  },
  [TokenType.EMAIL_VERIFICATION]: {
    type: TokenType.EMAIL_VERIFICATION,
    expiresIn: '24h'
  },
  [TokenType.PASSWORD_RESET]: {
    type: TokenType.PASSWORD_RESET,
    expiresIn: '1h'
  },
  [TokenType.RECOVERY]: {
    type: TokenType.RECOVERY,
    expiresIn: '1h'
  },
  [TokenType.API]: {
    type: TokenType.API,
    expiresIn: '30d'
  },
  [TokenType.TWO_FACTOR]: {
    type: TokenType.TWO_FACTOR,
    expiresIn: '5m'
  }
}; 