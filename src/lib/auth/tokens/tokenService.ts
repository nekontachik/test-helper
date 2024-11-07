import { TokenType, TokenPayload } from '@/types/token';
import jwt from 'jsonwebtoken';

export class TokenService {
  static async generateToken(payload: TokenPayload): Promise<string> {
    const secret = process.env.JWT_SECRET || 'default-secret';
    return jwt.sign(payload, secret, { expiresIn: '1h' });
  }

  static async validateToken(token: string): Promise<TokenPayload | null> {
    try {
      const secret = process.env.JWT_SECRET || 'default-secret';
      const payload = jwt.verify(token, secret) as TokenPayload;
      return payload;
    } catch (error) {
      return null;
    }
  }

  static async invalidateToken(token: string): Promise<void> {
    // Implementation would typically involve adding token to a blacklist
    // or updating a database record
    return;
  }
}