import { describe, it, expect } from 'vitest';
import {
  getCurrentTimestamp,
  getCurrentDate,
  isValidDate,
  formatDateForInput,
  formatDateWithSlash,
  formatDateJapanese,
} from './date';

describe('date utilities', () => {
  describe('getCurrentTimestamp', () => {
    it('returns ISO 8601 timestamp', () => {
      const timestamp = getCurrentTimestamp();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('getCurrentDate', () => {
    it('returns ISO 8601 date string', () => {
      const date = getCurrentDate();
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('isValidDate', () => {
    it('returns true for valid dates', () => {
      expect(isValidDate('2025-01-15')).toBe(true);
      expect(isValidDate('2025-12-31')).toBe(true);
      expect(isValidDate('2024-02-29')).toBe(true); // Leap year
    });

    it('returns false for invalid dates', () => {
      expect(isValidDate('2025-13-01')).toBe(false); // Invalid month
      expect(isValidDate('2025-01-32')).toBe(false); // Invalid day
      expect(isValidDate('2025-02-30')).toBe(false); // Invalid day for February
      expect(isValidDate('2023-02-29')).toBe(false); // Not a leap year
      expect(isValidDate('not-a-date')).toBe(false);
      expect(isValidDate('2025/01/15')).toBe(false); // Wrong format
      expect(isValidDate('15-01-2025')).toBe(false); // Wrong order
    });
  });

  describe('formatDateForInput', () => {
    it('formats date correctly for HTML input', () => {
      const date = new Date('2025-01-15T12:30:00Z');
      const formatted = formatDateForInput(date);
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('pads month and day with zeros', () => {
      const date = new Date('2025-03-05T00:00:00Z');
      const formatted = formatDateForInput(date);
      expect(formatted).toMatch(/2025-0[0-9]-0[0-9]/);
    });

    it('handles different dates correctly', () => {
      expect(formatDateForInput(new Date('2025-12-31T00:00:00Z'))).toMatch(/2025-12-31/);
      expect(formatDateForInput(new Date('2025-01-01T00:00:00Z'))).toMatch(/2025-01-01/);
    });
  });

  describe('formatDateWithSlash', () => {
    it('converts YYYY-MM-DD to YYYY/MM/DD', () => {
      expect(formatDateWithSlash('2025-01-15')).toBe('2025/01/15');
      expect(formatDateWithSlash('2025-12-31')).toBe('2025/12/31');
    });

    it('handles all hyphens in the string', () => {
      expect(formatDateWithSlash('2025-03-05')).toBe('2025/03/05');
    });
  });

  describe('formatDateJapanese', () => {
    it('converts YYYY-MM-DD to YYYY年MM月DD日', () => {
      expect(formatDateJapanese('2025-01-15')).toBe('2025年01月15日');
      expect(formatDateJapanese('2025-12-31')).toBe('2025年12月31日');
    });

    it('returns original string if format is invalid', () => {
      expect(formatDateJapanese('invalid')).toBe('invalid');
      expect(formatDateJapanese('2025/01/15')).toBe('2025/01/15');
      expect(formatDateJapanese('2025-01')).toBe('2025-01');
      expect(formatDateJapanese('2025-01-15-extra')).toBe('2025-01-15-extra');
    });

    it('handles edge cases gracefully', () => {
      expect(formatDateJapanese('')).toBe('');
      expect(formatDateJapanese('--')).toBe('--');
    });
  });
});
