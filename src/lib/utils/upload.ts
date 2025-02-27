import { ApiError } from '@/lib/api/errorHandler';
import { imageSchema, documentSchema } from '@/lib/validation/schema';

export async function validateFile(
  file: File,
  type: 'image' | 'document' = 'image'
): Promise<File> {
  const schema = type === 'image' ? imageSchema : documentSchema;
  
  try {
    await schema.parseAsync({
      size: file.size,
      type: file.type,
    });
    return file;
  } catch (error) {
    console.error('File validation error:', error);
    throw new ApiError(
      'Invalid file',
      400,
      'INVALID_FILE'
    );
  }
}

export async function processUpload(
  file: File,
  type: 'image' | 'document' = 'image'
): Promise<string> {
  const validatedFile = await validateFile(file, type);
  
  // Here you would implement your actual file upload logic
  // This is just a placeholder
  const formData = new FormData();
  formData.append('file', validatedFile);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new ApiError(
      'Failed to upload file',
      500,
      'UPLOAD_FAILED'
    );
  }
  
  const { url } = await response.json();
  return url;
} 