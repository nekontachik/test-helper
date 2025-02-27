import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { errorHandler } from '@/middleware/errorHandler';
import { getProject, updateProject, deleteProject } from '@/lib/services/projectService';

export async function GET(
  _req: NextRequest, 
  { params }: { params: { projectId: string } }
): Promise<Response> {
  return errorHandler(_req, async () => {
    const project = await getProject(params.projectId);
    return NextResponse.json(project);
  });
}

export async function PUT(
  _req: NextRequest,
  { params }: { params: { projectId: string } }
): Promise<Response> {
  return errorHandler(_req, async () => {
    const data = await _req.json();
    const project = await updateProject(params.projectId, data);
    return NextResponse.json(project);
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { projectId: string } }
): Promise<Response> {
  return errorHandler(_req, async () => {
    await deleteProject(params.projectId);
    return NextResponse.json({ success: true });
  });
}
