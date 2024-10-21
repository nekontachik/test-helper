import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Test Management API',
      version: '1.0.0',
      description: 'API documentation for the Test Management application',
    },
  },
  apis: ['./src/app/api/**/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
