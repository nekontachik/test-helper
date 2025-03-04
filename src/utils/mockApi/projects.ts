import { mockProjects } from './mockData';
import { simulateApiDelay, logApiRequest } from './utils';
import type { ApiResponse, Project } from './types';

/**
 * Simulates fetching projects from an API
 * @returns Promise with API response containing projects or error
 */
export async function fetchProjects(): Promise<ApiResponse<Project[]>> {
  logApiRequest('Fetching projects');
  
  // Simulate API delay
  await simulateApiDelay(800);
  
  return {
    success: true,
    data: mockProjects
  };
}

/**
 * Simulates fetching a single project by ID
 * @param id - Project ID to fetch
 * @returns Promise with API response containing project or error
 */
export async function fetchProject(id: string): Promise<ApiResponse<Project>> {
  logApiRequest(`Fetching project with ID ${id}`);
  
  // Simulate API delay
  await simulateApiDelay(500);
  
  const project = mockProjects.find(p => p.id === id);
  
  if (!project) {
    return {
      success: false,
      error: 'Project not found'
    };
  }
  
  return {
    success: true,
    data: project
  };
}

/**
 * Simulates creating a new project
 * @param projectData - Project data to create
 * @returns Promise with API response containing created project or error
 */
export async function createProject(projectData: Partial<Project>): Promise<ApiResponse<Project>> {
  logApiRequest('Creating new project', projectData);
  
  // Simulate API delay
  await simulateApiDelay(1000);
  
  // In a real app, we would save the data to a database
  const newProject: Project = {
    id: `proj-${Date.now()}`,
    name: projectData.name || 'Untitled Project',
    description: projectData.description || '',
    status: projectData.status || 'active',
    testCaseCount: 0,
    testRunCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  };
  
  return {
    success: true,
    data: newProject
  };
}

/**
 * Simulates updating a project
 * @param id - Project ID to update
 * @param projectData - Project data to update
 * @returns Promise with API response containing updated project or error
 */
export async function updateProject(id: string, projectData: Partial<Project>): Promise<ApiResponse<Project>> {
  logApiRequest(`Updating project with ID ${id}`, projectData);
  
  // Simulate API delay
  await simulateApiDelay(800);
  
  const project = mockProjects.find(p => p.id === id);
  
  if (!project) {
    return {
      success: false,
      error: 'Project not found'
    };
  }
  
  // In a real app, we would update the database
  // For mock purposes, we'll just return success with the updated data
  const updatedProject: Project = {
    ...project,
    ...projectData,
    id: project.id, // Ensure ID is preserved
    updatedAt: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  };
  
  return {
    success: true,
    data: updatedProject
  };
} 