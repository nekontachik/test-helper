import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';
import { getServerSession } from 'next-auth';
import { commentSchema } from '@/lib/validation';
import { randomUUID } from 'crypto';
import { PrismaErrorHandler } from '@/lib/prismaErrorHandler';
import { SQLQueryBuilder } from '@/lib/sqlQueryBuilder';

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
  { params }: { params: { projectId: string; testCaseId: string } }
) {
  const { projectId, testCaseId } = params;
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    if (req.method === 'GET') {
      const query = SQLQueryBuilder.buildSelectQuery(
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

      const formattedComments = comments.map(comment => ({
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
        updatedAt: comment.updatedAt,
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
        updatedAt: createdComment.updatedAt,
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

export const GET = withAuth(handler, {
  allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EDITOR, UserRole.USER]
});

export const POST = withAuth(handler, {
  allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EDITOR]
});
