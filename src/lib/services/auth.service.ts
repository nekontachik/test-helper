import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';
import type { UserRole } from '@/types/auth';
import type { CoreUser } from '@/lib/types/auth';

export class AuthService {
  static async validateCredentials(email: string, password: string): Promise<CoreUser | null> {
    try {
      logger.info('Validating credentials for user', { 
        email,
        passwordProvided: !!password,
        passwordLength: password?.length
      });
      
      // Log database connection status
      try {
        await prisma.$queryRaw`SELECT 1`;
        logger.info('Database connection successful');
      } catch (dbError) {
        logger.error('Database connection failed', {
          error: dbError instanceof Error ? dbError.message : String(dbError)
        });
      }
      
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          role: true,
          name: true,
          image: true,
          status: true
        }
      });
      
      logger.debug('User lookup result', { 
        found: !!user, 
        email,
        userFields: user ? Object.keys(user) : [],
        status: user?.status
      });
      
      if (!user) {
        logger.warn('User not found', { email });
        return null;
      }
      
      if (user.status !== 'ACTIVE') {
        logger.warn('User account not active', { email, status: user.status });
        return null;
      }
      
      logger.debug('Comparing passwords', { 
        hasStoredPassword: !!user.password,
        storedPasswordLength: user.password?.length
      });
      
      const isValid = await bcrypt.compare(password, user.password);
      logger.debug('Password validation result', { isValid, email });
      
      if (!isValid) {
        logger.warn('Invalid password', { email });
        return null;
      }
      
      const result = {
        id: user.id,
        email: user.email,
        role: user.role as UserRole,
        name: user.name,
        image: user.image
      };
      
      logger.info('Credentials validated successfully', {
        userId: result.id,
        email: result.email,
        role: result.role
      });
      
      return result;
    } catch (error) {
      logger.error('Auth validation error:', { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        errorType: error?.constructor?.name || typeof error,
        email 
      });
      return null;
    }
  }
  
  static async createTestUser(): Promise<void> {
    try {
      const testEmail = 'test@example.com';
      
      // Check if test user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: testEmail }
      });
      
      if (existingUser) {
        logger.info('Test user already exists', { email: testEmail });
        return;
      }
      
      // Create a test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await prisma.user.create({
        data: {
          email: testEmail,
          password: hashedPassword,
          role: 'ADMIN',
          name: 'Test User',
          status: 'ACTIVE'
        }
      });
      
      logger.info('Test user created successfully', { email: testEmail });
    } catch (error) {
      logger.error('Failed to create test user:', { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }
} 