import { Prisma, Project } from '@prisma/client';

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type ProjectCreateInput = Prisma.ProjectCreateInput;
export type ProjectUpdateInput = Partial<Prisma.ProjectCreateInput>;

export interface ProjectResponse {
  project: Project & {
    user: { id: string; name: string; email: string };
    testCases: { id: string }[];
    testSuites: { id: string }[];
  };
}

export interface ProjectsResponse {
  items: ProjectResponse['project'][];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

export type ProjectWithRelations = ProjectResponse['project'];
