import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { UserRole } from '@/types/auth'; // Fix: Import from auth types

// Update the Prisma mock to include the attachment model
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: {
    testCase: {
      findUnique: jest.fn(),
    },
    testCaseAttachment: { // Changed from 'attachment' to 'testCaseAttachment'
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

describe('File Upload Security', () => {
  let postHandler: (req: NextRequest) => Promise<any>;
  
  const mockUser = {
    id: '1',
    role: UserRole.TESTER,
  };

  beforeAll(async () => {
    postHandler = await POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue({ user: mockUser });
  });

  it('should validate file type', async () => {
    const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
    const formData = new FormData();
    formData.append('file', file);

    const request = new NextRequest('http://localhost:3000/api/test-cases/1/attachments', {
      method: 'POST',
      body: formData,
    });

    const response = await postHandler(request);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: 'Invalid file type',
    });
  });

  it('should validate file size', async () => {
    const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.txt', { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', largeFile);

    const request = new NextRequest('http://localhost:3000/api/test-cases/1/attachments', {
      method: 'POST',
      body: formData,
    });

    const response = await postHandler(request);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: 'File size exceeds limit',
    });
  });

  it('should accept valid files', async () => {
    const validFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', validFile);

    const request = new NextRequest('http://localhost:3000/api/test-cases/1/attachments', {
      method: 'POST',
      body: formData,
    });

    const mockAttachment = {
      id: '1',
      fileName: 'test.txt',
      fileSize: 12,
      mimeType: 'text/plain',
      testCaseId: '1',
    };

    (prisma.testCaseAttachment.create as jest.Mock).mockResolvedValue(mockAttachment);

    const response = await postHandler(request);
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(mockAttachment);
  });
});
