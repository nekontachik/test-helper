import type { Project, ProjectFormData, PaginatedResponse } from '../../../types';

export interface ProjectsApiClient {
  getProjects(page?: number, limit?: number): Promise<PaginatedResponse<Project>>;
  getProject(projectId: string): Promise<Project>;
  createProject(data: ProjectFormData): Promise<Project>;
} 