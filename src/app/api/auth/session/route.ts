import { type NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import logger from '@/lib/utils/logger';

// Define the token payload interface
interface TokenPayload {
  sub?: string; // JWT standard for subject (user ID)
  id?: string;
  email: string;
  role?: string;
  name?: string;
  image?: string;
  iat?: number;
  exp?: number;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    logger.debug('Session check requested');
    
    // Get the token from the cookie
    const token = request.cookies.get('session-token')?.value;
    
    if (!token) {
      logger.debug('No session token found');
      return NextResponse.json({ user: null }, { status: 200 });
    }
    
    try {
      // Verify the token
      const decoded = verify(
        token, 
        process.env.NEXTAUTH_SECRET || 'a-very-secure-secret-for-development-only'
      ) as TokenPayload;
      
      logger.debug('Token decoded', { 
        decodedFields: Object.keys(decoded),
        sub: decoded.sub,
        id: decoded.id
      });
      
      // Return the user data
      const user = {
        id: decoded.sub || decoded.id || 'unknown-id', // Use sub as primary ID (JWT standard)
        email: decoded.email,
        name: decoded.name,
        image: decoded.image,
        role: decoded.role
      };
      
      logger.debug('Session token verified', { 
        userId: user.id,
        email: user.email,
        role: user.role
      });
      
      return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
      logger.error('Invalid session token', { 
        error: error instanceof Error ? error.message : String(error)
      });
      
      return NextResponse.json({ user: null }, { status: 200 });
    }
  } catch (error) {
    logger.error('Error checking session', { 
      error: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 