import { Prisma } from '@prisma/client';

export class PrismaErrorHandler {
  static handle(error: unknown): { message: string; status: number } {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002': // Unique constraint violation
          return {
            message: 'A record with this value already exists',
            status: 409
          };
        case 'P2014': // Invalid ID
          return {
            message: 'Invalid ID provided',
            status: 400
          };
        case 'P2003': // Foreign key constraint failed
          return {
            message: 'Related record not found',
            status: 404
          };
        case 'P2025': // Record not found
          return {
            message: 'Record not found',
            status: 404
          };
        default:
          console.error('Prisma Error:', error);
          return {
            message: 'Database operation failed',
            status: 500
          };
      }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return {
        message: 'Invalid data provided',
        status: 400
      };
    }

    console.error('Unexpected Error:', error);
    return {
      message: 'Internal server error',
      status: 500
    };
  }
}
