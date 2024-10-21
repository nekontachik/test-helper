import {
  ApplicationError,
  DatabaseError,
  ValidationError,
  NotFoundError,
} from './errors';

describe('Custom Error Classes', () => {
  it('ApplicationError should have correct name and message', () => {
    const error = new ApplicationError('Test error');
    expect(error.name).toBe('ApplicationError');
    expect(error.message).toBe('Test error');
  });

  it('DatabaseError should have correct name and message', () => {
    const error = new DatabaseError('Database error');
    expect(error.name).toBe('DatabaseError');
    expect(error.message).toBe('Database error');
  });

  it('ValidationError should have correct name and message', () => {
    const error = new ValidationError('Validation error');
    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('Validation error');
  });

  it('NotFoundError should have correct name and message', () => {
    const error = new NotFoundError('Not found error');
    expect(error.name).toBe('NotFoundError');
    expect(error.message).toBe('Not found error');
  });
});
