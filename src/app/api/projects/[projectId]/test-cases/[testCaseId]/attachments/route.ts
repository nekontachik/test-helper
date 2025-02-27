import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/types/api';
import { withAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import { PrismaErrorHandler } from '@/lib/prismaErrorHandler';
import { SQLQueryBuilder } from '@/lib/sqlQueryBuilder';
import { randomUUID } from 'crypto';
import { getServerSession } from 'next-auth';

// Define the USER_ROLES enum values
const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'PROJECT_MANAGER',
  EDITOR: 'TESTER',
  USER: 'USER'
} as const;

// Define the TestCaseAttachment interface
interface TestCaseAttachment {
  id: string;
  testCaseId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

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

// Define the handler function type to match what withAuth expects
type HandlerFunction<T = unknown> = (
  req: Request,
  params: { params: { projectId: string; testCaseId: string } }
) => Promise<NextResponse<T>>;

const handler: HandlerFunction = async (req, { params }) => {
  const { testCaseId } = params;
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json(
      createErrorResponse('Unauthorized', 'ERROR_CODE', 401),
      { status: 401 }
    );
  }

  try {
    if (req.method === 'GET') {
      // We don't need to use the query variable, so we can remove it
      SQLQueryBuilder.buildSelectQuery('TestCaseAttachment', 
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
          createErrorResponse('No file provided', 'ERROR_CODE', 400),
          { status: 400 }
        );
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return NextResponse.json(
          createErrorResponse('Invalid file type', 'ERROR_CODE', 400),
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          createErrorResponse('File size exceeds limit', 'ERROR_CODE', 400),
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
        updatedAt: new Date()
      };

      // Build the insert query
      SQLQueryBuilder.buildInsertQuery('TestCaseAttachment', insertData);
      
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
      createErrorResponse('Method not allowed', 'ERROR_CODE', 405),
      { status: 405 }
    );
  } catch (error) {
    const { message, status } = PrismaErrorHandler.handle(error);
    return NextResponse.json({ message }, { status });
  }
};

export const GET = withAuth(handler, {
  allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EDITOR, USER_ROLES.USER]
});

export const POST = withAuth(handler, {
  allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EDITOR]
});

export const DELETE = withAuth(handler, {
  allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER]
});
