import type { OpenAPIV3 } from 'openapi-types';
import { createSwaggerSpec } from 'next-swagger-doc';

/**
 * Swagger/OpenAPI Documentation Configuration
 */
export const swaggerConfig: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'Test Case Management API',
    version: '1.0.0',
    description: 'API for managing test cases, runs, and results'
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      description: 'API Server'
    }
  ],
  paths: {
    '/api/projects/{projectId}/test-cases': {
      get: {
        summary: 'Get test cases',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'List of test cases',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/TestCase' }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create test case',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TestCaseInput' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Test case created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TestCase' }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      TestCase: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          steps: { type: 'string' },
          expectedResult: { type: 'string' },
          actualResult: { type: 'string' },
          status: { type: 'string', enum: ['ACTIVE', 'DRAFT', 'ARCHIVED'] },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
          projectId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'title', 'steps', 'expectedResult', 'status', 'priority', 'projectId']
      },
      TestCaseInput: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          steps: { type: 'string' },
          expectedResult: { type: 'string' },
          actualResult: { type: 'string' },
          status: { type: 'string', enum: ['ACTIVE', 'DRAFT', 'ARCHIVED'] },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] }
        },
        required: ['title', 'steps', 'expectedResult', 'status', 'priority']
      }
    }
  }
};

export const getApiDocs = (): ReturnType<typeof createSwaggerSpec> => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Test Management API',
        version: '1.0.0',
        description: 'API documentation for the Test Management System',
      },
      components: {
        schemas: {
          TestCase: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              title: { type: 'string', minLength: 1, maxLength: 200 },
              description: { type: 'string', minLength: 1, maxLength: 2000 },
              priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
              status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'DEPRECATED'] },
              projectId: { type: 'string', format: 'uuid' },
            },
            required: ['title', 'description', 'priority', 'projectId'],
          },
        },
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  return spec;
};

export default swaggerConfig; 