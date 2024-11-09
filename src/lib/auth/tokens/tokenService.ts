import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  type: TokenType;
}

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
  PASSWORD_RESET = 'password_reset'
}

export class TokenService {
  static async createToken(payload: TokenPayload, expiresIn: string): Promise<string> {
    const secret = process.env.JWT_SECRET || 'default-secret';
    return jwt.sign(payload, secret, { expiresIn });
  }

  static async verifyToken(token: string, type: TokenType): Promise<TokenPayload | null> {
    try {
      const secret = process.env.JWT_SECRET || 'default-secret';
      const payload = jwt.verify(token, secret) as TokenPayload;
      if (payload.type !== type) {
        return null;
      }
      return payload;
    } catch (error) {
      return null;
    }
  }

  static async revokeToken(token: string, type: TokenType): Promise<void> {
    // Implementation would typically involve adding token to a blacklist
    // or updating a database record
    return;
  }
}