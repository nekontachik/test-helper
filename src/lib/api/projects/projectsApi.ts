import type { Project, ProjectFormData, PaginatedResponse } from '../../../types';
import type { ProjectsApiClient } from './types';
import apiClient from '../core/apiClient';

const projectsApi: ProjectsApiClient = {
  async getProjects(page = 1, limit = 10): Promise<PaginatedResponse<Project>> {
    return apiClient.get<PaginatedResponse<Project>>('/projects', { page, limit });
  },

  async getProject(projectId: string): Promise<Project> {
    return apiClient.get<Project>(`/projects/${projectId}`);
  },

  async createProject(data: ProjectFormData): Promise<Project> {
    return apiClient.post<Project>('/projects', data);
  },
};

export default projectsApi; 