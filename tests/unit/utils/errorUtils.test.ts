import { formatError, handleApiError } from '@/lib/utils/errorUtils';
import { ApiError } from '@/lib/errors/types';
import { logger } from '@/lib/logger';

jest.mock('@/lib/logger');

describe('errorUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatError', () => {
    it('should format Error objects', () => {
      const error = new Error('Test error');
      const result = formatError(error);
      
      expect(result).toEqual({
        message: 'Test error',
        stack: error.stack,
      });
    });

    it('should format string errors', () => {
      const result = formatError('Test error');
      
      expect(result).toEqual({
        message: 'Test error',
      });
    });

    it('should format unknown errors', () => {
      const result = formatError({ custom: 'error' });
      
      expect(result).toEqual({
        message: 'Unknown error',
        data: { custom: 'error' },
      });
    });
  });

  describe('handleApiError', () => {
    it('should log and return formatted API errors', () => {
      const apiError: ApiError = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: { field: 'email' },
      };

      const result = handleApiError(apiError);
      
      expect(logger.error).toHaveBeenCalledWith('API Error:', expect.objectContaining({
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
      }));
      
      expect(result).toEqual({
        success: false,
        error: apiError,
      });
    });

    it('should handle and format Error objects', () => {
      const error = new Error('Test error');
      const result = handleApiError(error);
      
      expect(logger.error).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: expect.objectContaining({
          message: 'Test error',
        }),
      });
    });
  });
}); 