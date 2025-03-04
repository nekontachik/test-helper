import { get, post, put, del } from '../core/httpMethods';
import { handleApiError } from '../utils/errorHandler';
import type { Project, ProjectFormData, PaginatedResponse } from '@/types';

/**
 * Projects API endpoints
 */
export const projectsApi = {
  /**
   * Get all projects with pagination
   */
  async getProjects(page = 1, limit = 10): Promise<PaginatedResponse<Project>> {
    try {
      return await get<PaginatedResponse<Project>>('/projects', { page, limit });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get a single project by ID
   */
  async getProject(projectId: string): Promise<Project> {
    try {
      return await get<Project>(`/projects/${projectId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Create a new project
   */
  async createProject(data: ProjectFormData): Promise<Project> {
    try {
      return await post<Project>('/projects', data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update an existing project
   */
  async updateProject(projectId: string, data: Partial<ProjectFormData>): Promise<Project> {
    try {
      return await put<Project>(`/projects/${projectId}`, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      await del(`/projects/${projectId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}; 