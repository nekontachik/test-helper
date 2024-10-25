import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaErrorHandler } from '@/lib/prismaErrorHandler';
import { SQLQueryBuilder } from '@/lib/sqlQueryBuilder';
import type { TestCaseAttachment } from '@prisma/client';

// Add at the top
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain',
];

interface TestCaseAttachmentWithUser extends TestCaseAttachment {
  user: {
    id: string;
    name: string;
    email: string;
  };
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
      const query = SQLQueryBuilder.buildSelectQuery('TestCaseAttachment', 
        { testCaseId },
        { column: 'createdAt', direction: 'DESC' }
      );
      
      const attachments = await prisma.$queryRaw<TestCaseAttachmentWithUser[]>`
        SELECT a.*, u.name as userName, u.email as userEmail
        FROM TestCaseAttachment a
        JOIN User u ON a.uploadedBy = u.id
        WHERE a.testCaseId = ${testCaseId}
        ORDER BY a.createdAt DESC
      `;
      return NextResponse.json(attachments);
    }

    if (req.method === 'POST') {
      const formData = await req.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json(
          { message: 'No file provided' },
          { status: 400 }
        );
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { message: 'Invalid file type' },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { message: 'File size exceeds limit' },
          { status: 400 }
        );
      }

      const insertData = {
        id: randomUUID(),
        testCaseId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        url: `https://storage.example.com/${testCaseId}/${file.name}`,
        uploadedBy: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const query = SQLQueryBuilder.buildInsertQuery('TestCaseAttachment', insertData);
      const [createdAttachment] = await prisma.$queryRaw<[TestCaseAttachmentWithUser]>`
        SELECT a.*, u.name as userName, u.email as userEmail
        FROM TestCaseAttachment a
        JOIN User u ON a.uploadedBy = u.id
        WHERE a.id = ${insertData.id}
      `;

      return NextResponse.json(createdAttachment, { status: 201 });
    }

    if (req.method === 'DELETE') {
      const { id } = await req.json();
      await prisma.$executeRaw`
        DELETE FROM TestCaseAttachment
        WHERE id = ${id} AND testCaseId = ${testCaseId}
      `;

      return NextResponse.json({ message: 'Attachment deleted successfully' });
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
  allowedRoles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TESTER, UserRole.USER]
});

export const POST = withAuth(handler, {
  allowedRoles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TESTER]
});

export const DELETE = withAuth(handler, {
  allowedRoles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER]
});
