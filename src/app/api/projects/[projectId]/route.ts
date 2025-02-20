import { errorHandler } from '@/middleware/errorHandler';
import { NextRequest } from 'next/server';
import { getProject, updateProject, deleteProject } from '@/lib/services/projectService';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  return errorHandler(request, async () => {
    const project = await getProject(params.projectId);
    return Response.json(project);
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  return errorHandler(request, async () => {
    const data = await request.json();
    const project = await updateProject(params.projectId, data);
    return Response.json(project);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  return errorHandler(request, async () => {
    await deleteProject(params.projectId);
    return Response.json({ success: true });
  });
}
