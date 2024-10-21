import NextAuth, { NextAuthOptions, Session, User } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '../../../lib/prisma';

// Add your providers here

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Your providers configuration
  ],
  callbacks: {
    session: ({ session, user }: { session: Session; user: User }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
};

export default NextAuth(authOptions);
