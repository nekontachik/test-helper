import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { withAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaErrorHandler } from '@/lib/prismaErrorHandler';
import { SQLQueryBuilder } from '@/lib/sqlQueryBuilder';

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
  updatedAt: Date; }

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
    email: string; }; }

async function handler(
  req: Request,
  { params }: { params: { projectId: string; testCaseId: string }
}

) {
  const { projectId, testCaseId } = params;
  const session = await getServerSession();

  if (!session?.user) {
    return createErrorResponse('Unauthorized', 'ERROR_CODE', 401); }

  try {
    if (_req.method === 'GET') {
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
      return NextResponse.json(attachments); }

    if (_req.method === 'POST') {
      const formData = await _req.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return createErrorResponse('No file provided', 'ERROR_CODE', 400); }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return createErrorResponse('Invalid file type', 'ERROR_CODE', 400); }

      if (file.size > MAX_FILE_SIZE) {
        return createErrorResponse('File size exceeds limit', 'ERROR_CODE', 400); }

      const insertData = {
        id: randomUUID(),
        testCaseId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        url: `https://storage.example.com/${testCaseId}/${file.name}`,
        uploadedBy: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date() };

      const query = SQLQueryBuilder.buildInsertQuery('TestCaseAttachment', insertData);
      const [createdAttachment] = await prisma.$queryRaw<[TestCaseAttachmentWithUser]>`
        SELECT a.*, u.name as userName, u.email as userEmail
        FROM TestCaseAttachment a
        JOIN User u ON a.uploadedBy = u.id
        WHERE a.id = ${insertData.id}
      `;

      return NextResponse.json(createdAttachment, { status: 201 }); }

    if (_req.method === 'DELETE') {
      const { id } = await _req.json();
      await prisma.$executeRaw`
        DELETE FROM TestCaseAttachment
        WHERE id = ${id} AND testCaseId = ${testCaseId}
      `;

      return createErrorResponse('Attachment deleted successfully'); }

    return createErrorResponse('Method not allowed', 'ERROR_CODE', 405); } catch (error) {
    const { message, status } = PrismaErrorHandler.handle(error);
    return NextResponse.json({ message }, { status }); }
}

export const GET = withAuth(handler, {
  allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EDITOR, UserRole.USER] });

export const POST = withAuth(handler, {
  allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EDITOR] });

export const DELETE = withAuth(handler, {
  allowedRoles: [UserRole.ADMIN, UserRole.MANAGER] });
