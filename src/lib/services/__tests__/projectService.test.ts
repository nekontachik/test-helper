import { getProject, createProject, updateProject, deleteProject } from '../projectService';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { BaseError } from '@/lib/errors/BaseError';

jest.mock('next-auth');
jest.mock('@/lib/prisma');

describe('projectService', () => {
  const mockUser = { id: 'user-1', email: 'test@example.com' };
  const mockSession = { user: mockUser };
  const mockProject = {
    id: 'project-1',
    name: 'Test Project',
    userId: mockUser.id,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('getProject', () => {
    it('should return project if found', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const result = await getProject('project-1');
      expect(result).toEqual(mockProject);
    });

    it('should throw if not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      await expect(getProject('project-1')).rejects.toThrow('Not authenticated');
    });

    it('should throw if project not found', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getProject('project-1')).rejects.toThrow('Project not found');
    });
  });

  describe('createProject', () => {
    it('should create project successfully', async () => {
      (prisma.project.count as jest.Mock).mockResolvedValue(0);
      (prisma.project.create as jest.Mock).mockResolvedValue(mockProject);

      const result = await createProject({ name: 'Test Project' });
      expect(result).toEqual(mockProject);
    });

    it('should throw if project limit reached', async () => {
      (prisma.project.count as jest.Mock).mockResolvedValue(50);

      await expect(createProject({ name: 'Test Project' }))
        .rejects.toThrow('Project limit reached');
    });
  });

  describe('deleteProject', () => {
    it('should delete project and related records', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.$transaction as jest.Mock).mockResolvedValue([]);

      await deleteProject('project-1');

      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw if project not found', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(deleteProject('project-1'))
        .rejects.toThrow('Project not found');
    });
  });
}); 