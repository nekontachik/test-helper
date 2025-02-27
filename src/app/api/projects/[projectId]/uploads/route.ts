import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(
  req: NextRequest, 
  { params }: { params: { projectId: string } }
): Promise<ApiResponse<unknown>> {
  try {
    // Validate projectId
    const { projectId } = params;
    if (!projectId) {
      return createErrorResponse('Project ID is required', 'MISSING_PROJECT_ID', 400);
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return createErrorResponse('No file provided', 'MISSING_FILE', 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return createErrorResponse('File size exceeds limit (10MB)', 'FILE_TOO_LARGE', 400);
    }

    // Save file in project-specific directory
    const projectUploadDir = join(UPLOAD_DIR, projectId);
    await mkdir(projectUploadDir, { recursive: true });

    // Generate unique filename
    const ext = file.name.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;
    const filepath = join(projectUploadDir, filename);

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file
    await writeFile(filepath, buffer);

    // Return project-specific URL
    const url = `/uploads/${projectId}/${filename}`;

    return createSuccessResponse({ url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return createErrorResponse('Failed to upload file', 'UPLOAD_FAILED', 500);
  }
}
