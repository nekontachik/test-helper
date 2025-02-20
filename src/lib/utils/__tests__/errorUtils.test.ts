import { normalizeError, formatErrorResponse, logError } from '../errorUtils';
import { TestRunError } from '@/lib/errors/specific/testErrors';
import { BaseError } from '@/lib/errors/BaseError';
import { logger } from '../logger';

jest.mock('../logger');

describe('errorUtils', () => {
  describe('normalizeError', () => {
    it('should return BaseError instance unchanged', () => {
      const error = new TestRunError('Test error');
      const result = normalizeError(error);
      expect(result).toBe(error);
    });

    it('should convert Error to BaseError', () => {
      const error = new Error('Standard error');
      const result = normalizeError(error);
      expect(result).toBeInstanceOf(BaseError);
      expect(result.message).toBe('Standard error');
    });

    it('should convert string to BaseError', () => {
      const result = normalizeError('Error message');
      expect(result).toBeInstanceOf(BaseError);
      expect(result.message).toBe('Error message');
    });
  });

  describe('formatErrorResponse', () => {
    it('should format error response correctly', () => {
      const error = new TestRunError('Test failed', {
        status: 400,
        details: { reason: 'Invalid input' }
      });

      const response = formatErrorResponse(error);
      expect(response).toEqual({
        success: false,
        error: {
          code: 'TEST_RUN_ERROR',
          message: 'Test failed',
          details: { reason: 'Invalid input' }
        }
      });
    });
  });

  describe('logError', () => {
    it('should log error with context', () => {
      const error = new TestRunError('Test failed');
      const context = { userId: '123' };

      logError(error, context);

      expect(logger.error).toHaveBeenCalledWith(
        'Error occurred:',
        expect.objectContaining({
          code: 'TEST_RUN_ERROR',
          message: 'Test failed',
          context: { userId: '123' }
        })
      );
    });
  });
}); 