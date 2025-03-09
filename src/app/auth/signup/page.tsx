import { SignUpForm } from '@/components/auth';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Box } from '@chakra-ui/react';
import { logger } from '@/lib/logger';

// Set to true to bypass authentication in development
const DEV_MODE = true;

export default async function SignUpPage(): Promise<JSX.Element> {
  try {
    logger.debug('SignUpPage - Component rendering');
    
    // In development mode, bypass authentication and redirect to dashboard
    if (DEV_MODE) {
      logger.info('SignUpPage - Development mode, redirecting to dashboard');
      redirect('/dashboard');
    }
    
    const session = await getServerSession(authOptions);

    if (session) {
      logger.info('SignUpPage - Redirecting authenticated user to dashboard');
      redirect('/dashboard');
    }

    return (
      <Box className="container mx-auto max-w-lg py-8">
        <SignUpForm />
      </Box>
    );
  } catch (error) {
    logger.error('SignUpPage - Error:', error);
    throw error;
  }
}
