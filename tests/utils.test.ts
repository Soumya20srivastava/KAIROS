// Utility Functions Tests
import {
  cn,
  formatDuration,
  formatDate,
  formatRelativeTime,
  truncate,
  getInitials,
  generateId,
  sleep,
  debounce,
  getApiError,
  isClient,
  getErrorMessage,
  clamp,
  isValidEmail,
  isValidUsername,
  getPriorityLabel,
  getPriorityColor,
  getStatusColor,
  getStatusBgColor,
} from '@/lib/utils';

describe('Utility Functions', () => {
  describe('cn', () => {
    it('joins class names', () => {
      expect(cn('a', 'b', 'c')).toBe('a b c');
    });

    it('handles conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional');
    });

    it('merges tailwind classes correctly', () => {
      expect(cn('p-2 p-4')).toBe('p-4');
    });
  });

  describe('formatDuration', () => {
    it('formats milliseconds', () => {
      expect(formatDuration(500)).toBe('500ms');
    });

    it('formats seconds', () => {
      expect(formatDuration(1500)).toBe('1.5s');
    });

    it('formats minutes', () => {
      expect(formatDuration(90000)).toBe('1.5m');
    });

    it('formats hours', () => {
      expect(formatDuration(7200000)).toBe('2h');
    });
  });

  describe('formatDate', () => {
    it('formats date string', () => {
      const date = '2024-01-15T10:30:00Z';
      const formatted = formatDate(date);
      expect(formatted).toContain('2024');
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
    });
  });

  describe('formatRelativeTime', () => {
    it('shows seconds for recent times', () => {
      const now = new Date();
      const fiveSecondsAgo = new Date(now.getTime() - 5000).toISOString();
      expect(formatRelativeTime(fiveSecondsAgo)).toBe('5s ago');
    });

    it('shows minutes for older times', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5m ago');
    });

    it('shows hours for even older times', () => {
      const now = new Date();
      const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString();
      expect(formatRelativeTime(fiveHoursAgo)).toBe('5h ago');
    });

    it('shows days for very old times', () => {
      const now = new Date();
      const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatRelativeTime(fiveDaysAgo)).toBe('5d ago');
    });
  });

  describe('truncate', () => {
    it('truncates long strings', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...');
    });

    it('returns original string if shorter than limit', () => {
      expect(truncate('Hi', 10)).toBe('Hi');
    });

    it('returns original string if exact length', () => {
      expect(truncate('Hello', 5)).toBe('Hello');
    });
  });

  describe('getInitials', () => {
    it('gets initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('handles single name', () => {
      expect(getInitials('John')).toBe('J');
    });

    it('limits to 2 characters', () => {
      expect(getInitials('John Michael Smith')).toBe('JM');
    });

    it('uppercases initials', () => {
      expect(getInitials('john doe')).toBe('JD');
    });
  });

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId('test');
      const id2 = generateId('test');
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^test_/);
    });
  });

  describe('sleep', () => {
    it('resolves after specified time', async () => {
      const start = Date.now();
      await sleep(50);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(40);
    });
  });

  describe('debounce', () => {
    it('delays function execution', async () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      expect(fn).not.toHaveBeenCalled();
      
      await sleep(150);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('getApiError', () => {
    it('extracts message from error object', () => {
      expect(getApiError({ message: 'Test error' })).toBe('Test error');
    });

    it('returns string error as is', () => {
      expect(getApiError('String error')).toBe('String error');
    });

    it('returns default for unknown errors', () => {
      expect(getApiError(null)).toBe('An unexpected error occurred');
      expect(getApiError({})).toBe('An unexpected error occurred');
    });
  });

  describe('isClient', () => {
    it('returns false in test environment', () => {
      expect(isClient()).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('returns error message for Error objects', () => {
      expect(getErrorMessage(new Error('Test error'))).toBe('Test error');
    });

    it('returns string for string errors', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    it('returns default for unknown', () => {
      expect(getErrorMessage(undefined)).toBe('Unknown error');
    });
  });

  describe('clamp', () => {
    it('clamps value to range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('isValidEmail', () => {
    it('validates correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.org')).toBe(true);
      expect(isValidEmail('user+tag@example.co.uk')).toBe(true);
    });

    it('rejects invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
    });
  });

  describe('isValidUsername', () => {
    it('validates correct usernames', () => {
      expect(isValidUsername('user123')).toBe(true);
      expect(isValidUsername('user_name')).toBe(true);
      expect(isValidUsername('User123')).toBe(true);
    });

    it('rejects invalid usernames', () => {
      expect(isValidUsername('us')).toBe(false); // too short
      expect(isValidUsername('a'.repeat(31))).toBe(false); // too long
      expect(isValidUsername('user-name')).toBe(false); // hyphen not allowed
      expect(isValidUsername('user name')).toBe(false); // space not allowed
      expect(isValidUsername('user@name')).toBe(false); // special char not allowed
    });
  });

  describe('getPriorityLabel', () => {
    it('returns correct labels', () => {
      expect(getPriorityLabel(1)).toBe('Critical');
      expect(getPriorityLabel(2)).toBe('High');
      expect(getPriorityLabel(3)).toBe('Medium');
      expect(getPriorityLabel(4)).toBe('Low');
      expect(getPriorityLabel(5)).toBe('Trivial');
      expect(getPriorityLabel(0)).toBe('None');
      expect(getPriorityLabel(99)).toBe('None');
    });
  });

  describe('getPriorityColor', () => {
    it('returns correct color classes', () => {
      expect(getPriorityColor(1)).toBe('text-red-400');
      expect(getPriorityColor(2)).toBe('text-orange-400');
      expect(getPriorityColor(3)).toBe('text-yellow-400');
      expect(getPriorityColor(4)).toBe('text-blue-400');
      expect(getPriorityColor(5)).toBe('text-gray-400');
    });
  });

  describe('getStatusColor', () => {
    it('returns correct color classes for statuses', () => {
      expect(getStatusColor('active')).toBe('text-cyan-400');
      expect(getStatusColor('completed')).toBe('text-green-400');
      expect(getStatusColor('running')).toBe('text-cyan-400');
      expect(getStatusColor('pending')).toBe('text-yellow-400');
      expect(getStatusColor('failed')).toBe('text-red-400');
      expect(getStatusColor('cancelled')).toBe('text-gray-400');
      expect(getStatusColor('unknown')).toBe('text-gray-500');
    });
  });

  describe('getStatusBgColor', () => {
    it('returns correct background color classes', () => {
      expect(getStatusBgColor('active')).toContain('bg-cyan-500/10');
      expect(getStatusBgColor('completed')).toContain('bg-green-500/10');
      expect(getStatusBgColor('failed')).toContain('bg-red-500/10');
    });
  });
});