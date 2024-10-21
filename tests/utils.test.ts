import { formatDate, calculatePercentage } from '../src/utils';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2023-05-15T12:00:00Z');
      expect(formatDate(date)).toBe('May 15, 2023');
    });

    it('handles different locales', () => {
      const date = new Date('2023-05-15T12:00:00Z');
      const originalLocale = Intl.DateTimeFormat().resolvedOptions().locale;
      
      Object.defineProperty(Intl, 'DateTimeFormat', {
        value: class {
          resolvedOptions() {
            return { locale: 'fr-FR' };
          }
        },
      });

      expect(formatDate(date)).toBe('15 mai 2023');

      Object.defineProperty(Intl, 'DateTimeFormat', {
        value: class {
          resolvedOptions() {
            return { locale: originalLocale };
          }
        },
      });
    });
  });

  describe('calculatePercentage', () => {
    it('calculates percentage correctly', () => {
      expect(calculatePercentage(75, 100)).toBe(75);
      expect(calculatePercentage(0, 100)).toBe(0);
      expect(calculatePercentage(100, 100)).toBe(100);
    });

    it('handles edge cases', () => {
      expect(calculatePercentage(50, 0)).toBe(0);
      expect(calculatePercentage(0, 0)).toBe(0);
    });

    it('rounds to two decimal places', () => {
      expect(calculatePercentage(1, 3)).toBeCloseTo(33.33);
      expect(calculatePercentage(2, 3)).toBeCloseTo(66.67);
    });
  });
});
