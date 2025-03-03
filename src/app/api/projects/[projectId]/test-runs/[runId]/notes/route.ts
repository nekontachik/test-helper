import { type NextRequest, NextResponse } from 'next/server';
import { createErrorResponse } from '@/types/api';
import { withAuth as _withAuth } from '@/lib/withAuth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';
import { getServerSession } from 'next-auth';
import { testRunNoteSchema } from '@/lib/validation';
import { randomUUID } from 'crypto';
import { type Session } from 'next-auth';
import { protect } from '@/lib/auth/protect';

interface TestRunNote {
  id: string;
  content: string;
  runId: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

async function handler(
  req: NextRequest,
  context: { params: { projectId: string; runId: string } }
): Promise<NextResponse> {
  const { runId } = context.params;
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json(
      createErrorResponse('Unauthorized', 'ERROR_CODE', 401),
      { status: 401 }
    );
  }

  if (req.method === 'GET') {
    try {
      const notes = await prisma.$queryRaw<TestRunNote[]>`
        SELECT n.*, u.name as userName, u.email as userEmail
        FROM TestRunNote n
        JOIN User u ON n.userId = u.id
        WHERE n.runId = ${runId}
        ORDER BY n.createdAt DESC
      `;

      const formattedNotes = notes.map((note: TestRunNote) => ({
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
        updatedAt: note.updatedAt
      }));

      return NextResponse.json(formattedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      return NextResponse.json(
        createErrorResponse('Failed to fetch notes', 'ERROR_CODE', 500),
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
          createErrorResponse('Note content exceeds maximum length of 2000 characters', 'ERROR_CODE', 400),
          { status: 400 }
        );
      }

      const note = await prisma.$executeRaw`
        INSERT INTO TestRunNote (id, content, runId, userId, createdAt, updatedAt)
        VALUES (${randomUUID()}, ${validated.content}, ${runId}, ${session.user.id}, ${new Date()}, ${new Date()})
      `;

      const createdNote = await prisma.$queryRaw<TestRunNote>`
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
        updatedAt: createdNote.updatedAt
      }, { status: 201 });
    } catch (error) {
      console.error('Error creating note:', error);
      return NextResponse.json(
        createErrorResponse('Failed to create note', 'ERROR_CODE', 500),
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    createErrorResponse('Method not allowed', 'ERROR_CODE', 405),
    { status: 405 }
  );
}

// Define a type for the route handler that's compatible with the protect function
type CompatibleRouteHandler = (
  req: NextRequest | Request,
  context: { params: Record<string, string>; session: Session }
) => Promise<NextResponse>;

// Modify the handler to work with protect
const routeHandler: CompatibleRouteHandler = (
  req: NextRequest | Request, 
  _context: { params: Record<string, string>; session: Session }
): Promise<NextResponse> => {
  // Extract params from the URL
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const projectId = pathParts[pathParts.indexOf('projects') + 1] || '';
  const runId = pathParts[pathParts.indexOf('test-runs') + 1] || '';
  
  // Cast req to NextRequest since our handler expects it
  return handler(req as NextRequest, { params: { projectId, runId } });
};

export const GET = protect(routeHandler, {
  roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EDITOR]
});

export const POST = protect(routeHandler, {
  roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EDITOR]
});

export const DELETE = protect(routeHandler, {
  roles: [UserRole.ADMIN, UserRole.MANAGER]
});
