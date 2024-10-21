import { formatDate } from './dateFormatter';

describe('dateFormatter', () => {
  it('should format date correctly', () => {
    const date = new Date('2023-01-01T12:00:00Z');
    expect(formatDate(date)).toBe('01/01/2023');
  });

  it('should handle different locales', () => {
    const date = new Date('2023-01-01T12:00:00Z');
    expect(formatDate(date, 'en-US')).toBe('1/1/2023');
    expect(formatDate(date, 'de-DE')).toBe('1.1.2023');
  });

  it('should handle custom format options', () => {
    const date = new Date('2023-01-01T12:00:00Z');
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    expect(formatDate(date, 'en-US', options)).toBe('January 1, 2023');
  });
});
