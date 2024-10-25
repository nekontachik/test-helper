import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { errorReporting } from '@/lib/errorReporting';
import { z } from 'zod';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

/**
 * GET handler for fetching all projects
 */
export async function GET() {
  try {
    const projects = await prisma.project.findMany();
    return NextResponse.json(projects);
  } catch (error) {
    errorReporting.logError('Failed to fetch projects', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

/**
 * POST handler for creating a new project
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = projectSchema.parse(body);
    
    const project = await prisma.project.create({
      data: {
        ...validatedData,
        user: {
          connect: { id: session.user.id }
        }
      },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    errorReporting.logError('Failed to create project', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
