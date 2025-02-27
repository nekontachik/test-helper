import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { errorHandler } from '@/middleware/errorHandler';
import { getProject, updateProject, deleteProject } from '@/lib/services/projectService';

export async function GET(_req: NextRequest): Promise<ApiResponse<unknown>> {
  return errorHandler(_req, async () => {
    const project = await getProject(params.projectId);
    return Response.json(project); }); }

export async function PUT(_req: NextRequest): Promise<ApiResponse<unknown>> {
  return errorHandler(_req, async () => {
    const data = await _req.json();
    const project = await updateProject(params.projectId, data);
    return Response.json(project); }); }

export async function DELETE(_req: NextRequest): Promise<ApiResponse<unknown>> {
  return errorHandler(_req, async () => {
    await deleteProject(params.projectId);
    return Response.json({ success: true }); }); }
