import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';
import { getServerSession } from 'next-auth';
import { testRunNoteSchema } from '@/lib/validation';
import { randomUUID } from 'crypto';

async function handler(
  req: Request,
  { params }: { params: { projectId: string; runId: string } }
) {
  const { projectId, runId } = params;
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (req.method === 'GET') {
    try {
      const notes = await prisma.$queryRaw<Array<any>>`
        SELECT n.*, u.name as userName, u.email as userEmail
        FROM TestRunNote n
        JOIN User u ON n.userId = u.id
        WHERE n.runId = ${runId}
        ORDER BY n.createdAt DESC
      `;

      const formattedNotes = notes.map(note => ({
        id: note.id,
        content: note.content,
        runId: note.runId,
        userId: note.userId,
        user: {
          id: note.userId,
          name: note.userName,
          email: note.userEmail,
        },
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      }));

      return NextResponse.json(formattedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      return NextResponse.json(
        { message: 'Failed to fetch notes' },
        { status: 500 }
      );
    }
  }

  if (req.method === 'POST') {
    try {
      const data = await req.json();
      const validated = testRunNoteSchema.parse(data);

      if (validated.content.length > 2000) {
        return NextResponse.json(
          { message: 'Note content exceeds maximum length of 2000 characters' },
          { status: 400 }
        );
      }

      const note = await prisma.$executeRaw`
        INSERT INTO TestRunNote (id, content, runId, userId, createdAt, updatedAt)
        VALUES (${randomUUID()}, ${validated.content}, ${runId}, ${session.user.id}, ${new Date()}, ${new Date()})
      `;

      const createdNote = await prisma.$queryRaw<any>`
        SELECT n.*, u.name as userName, u.email as userEmail
        FROM TestRunNote n
        JOIN User u ON n.userId = u.id
        WHERE n.id = ${note}
      `;

      return NextResponse.json({
        id: createdNote.id,
        content: createdNote.content,
        runId: createdNote.runId,
        userId: createdNote.userId,
        user: {
          id: createdNote.userId,
          name: createdNote.userName,
          email: createdNote.userEmail,
        },
        createdAt: createdNote.createdAt,
        updatedAt: createdNote.updatedAt,
      }, { status: 201 });
    } catch (error) {
      console.error('Error creating note:', error);
      return NextResponse.json(
        { message: 'Failed to create note' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}

export const GET = withAuth(handler, {
  allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EDITOR]
});

export const POST = withAuth(handler, {
  allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EDITOR]
});

export const DELETE = withAuth(handler, {
  allowedRoles: [UserRole.ADMIN, UserRole.MANAGER]
});
