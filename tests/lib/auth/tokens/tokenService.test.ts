import { TokenService } from '../tokenService';
import type { TokenPayload } from '@/types/token';
import { TokenType } from '@/types/token';

describe('TokenService', () => {
  it('should create and verify tokens', async () => {
    const payload: TokenPayload = {
      userId: '1',
      email: 'test@example.com',
      type: TokenType.EMAIL_VERIFICATION
    };
    
    const token = await TokenService.generateToken(payload);
    const verified = await TokenService.validateToken(token);
    expect(verified).toMatchObject(payload);
  });

  it('should invalidate tokens', async () => {
    const payload: TokenPayload = {
      userId: '1',
      email: 'test@example.com',
      type: TokenType.PASSWORD_RESET
    };
    
    const token = await TokenService.generateToken(payload);
    await TokenService.invalidateToken(token);
    const verified = await TokenService.validateToken(token);
    expect(verified).toBeNull();
  });
}); 