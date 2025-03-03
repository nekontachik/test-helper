import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { commentSchema } from '@/lib/validation';
import { randomUUID } from 'crypto';
import { PrismaErrorHandler } from '@/lib/prismaErrorHandler';
import { SQLQueryBuilder } from '@/lib/sqlQueryBuilder';
import { type Session } from 'next-auth';
import type { UserRole } from '@/types/auth';
import { protect } from '@/lib/auth/protect';

// Define UserRoles as an object with proper typing
const _UserRoles = {
  ADMIN: 'ADMIN',
  MANAGER: 'PROJECT_MANAGER',
  EDITOR: 'TESTER',
  USER: 'USER'
} as const;

// Create a type from the values and use it
type _AppUserRole = typeof _UserRoles[keyof typeof _UserRoles];

interface TestCaseComment {
  id: string;
  content: string;
  testCaseId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  userName: string;
  userEmail: string; 
}

async function handler(
  req: Request,
  context: { params: Record<string, string>; session: Session }
): Promise<NextResponse> {
  // Extract testCaseId from context
  const { testCaseId } = context.params;
  const session = context.session;

  if (!session?.user) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    if (req.method === 'GET') {
      // We'll keep the query builder for reference but not use it
      const _query = SQLQueryBuilder.buildSelectQuery(
        'TestCaseComment',
        { testCaseId },
        { column: 'createdAt', direction: 'DESC' }
      );

      const comments = await prisma.$queryRaw<TestCaseComment[]>`
        SELECT c.*, u.name as userName, u.email as userEmail
        FROM TestCaseComment c
        JOIN User u ON c.userId = u.id
        WHERE c.testCaseId = ${testCaseId}
        ORDER BY c.createdAt DESC
      `;

      const formattedComments = comments.map((comment: TestCaseComment) => ({
        id: comment.id,
        content: comment.content,
        testCaseId: comment.testCaseId,
        userId: comment.userId,
        user: {
          id: comment.userId,
          name: comment.userName,
          email: comment.userEmail,
        },
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt 
      }));

      return NextResponse.json(formattedComments); 
    }

    if (req.method === 'POST') {
      const data = await req.json();
      const validated = commentSchema.parse(data);

      const commentId = randomUUID();
      await prisma.$executeRaw`
        INSERT INTO TestCaseComment (
          id,
          content,
          testCaseId,
          userId,
          createdAt,
          updatedAt
        ) VALUES (
          ${commentId},
          ${validated.content},
          ${testCaseId},
          ${session.user.id},
          ${new Date()},
          ${new Date()}
        )
      `;

      const [createdComment] = await prisma.$queryRaw<[TestCaseComment]>`
        SELECT c.*, u.name as userName, u.email as userEmail
        FROM TestCaseComment c
        JOIN User u ON c.userId = u.id
        WHERE c.id = ${commentId}
      `;

      return NextResponse.json({
        id: createdComment.id,
        content: createdComment.content,
        testCaseId: createdComment.testCaseId,
        userId: createdComment.userId,
        user: {
          id: createdComment.userId,
          name: createdComment.userName,
          email: createdComment.userEmail,
        },
        createdAt: createdComment.createdAt,
        updatedAt: createdComment.updatedAt
      }, { status: 201 }); 
    }

    return NextResponse.json(
      { message: 'Method not allowed' },
      { status: 405 }
    );
  } catch (error) {
    const { message, status } = PrismaErrorHandler.handle(error);
    return NextResponse.json({ message }, { status }); 
  }
}

export const GET = protect(handler, {
  roles: ['ADMIN', 'PROJECT_MANAGER', 'TESTER', 'USER'] as UserRole[]
});

export const POST = protect(handler, {
  roles: ['ADMIN', 'PROJECT_MANAGER', 'TESTER'] as UserRole[]
});
