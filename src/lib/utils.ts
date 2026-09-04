// Utility functions for KAIROS
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  const hours = ms / 3600000;
  return `${Number.isInteger(hours) ? hours.toFixed(0) : hours.toFixed(1)}h`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  if (length <= 3) return str.slice(0, length);
  return str.slice(0, length - 3) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function generateId(prefix: string = ''): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function getApiError(error: unknown): string {
  if (error && typeof error === 'object') {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}

export function isClient(): boolean {
  return typeof window !== 'undefined' && process.env.NODE_ENV !== 'test' && !(globalThis as { jest?: unknown }).jest;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error';
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,30}$/.test(username);
}

export function getPriorityLabel(priority: number): string {
  const labels: Record<number, string> = {
    1: 'Critical',
    2: 'High',
    3: 'Medium',
    4: 'Low',
    5: 'Trivial',
  };
  return labels[priority] || 'None';
}

export function getPriorityColor(priority: number): string {
  const colors: Record<number, string> = {
    1: 'text-red-400',
    2: 'text-orange-400',
    3: 'text-yellow-400',
    4: 'text-blue-400',
    5: 'text-gray-400',
  };
  return colors[priority] || 'text-gray-500';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'text-cyan-400',
    completed: 'text-green-400',
    running: 'text-cyan-400',
    pending: 'text-yellow-400',
    failed: 'text-red-400',
    cancelled: 'text-gray-400',
    archived: 'text-gray-500',
    draft: 'text-gray-400',
    timeout: 'text-orange-400',
    retrying: 'text-yellow-400',
  };
  return colors[status] || 'text-gray-500';
}

export function getStatusBgColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-cyan-500/10 border-cyan-500/30',
    completed: 'bg-green-500/10 border-green-500/30',
    running: 'bg-cyan-500/10 border-cyan-500/30',
    pending: 'bg-yellow-500/10 border-yellow-500/30',
    failed: 'bg-red-500/10 border-red-500/30',
    cancelled: 'bg-gray-500/10 border-gray-500/30',
    archived: 'bg-gray-500/10 border-gray-500/30',
    draft: 'bg-gray-500/10 border-gray-500/30',
    timeout: 'bg-orange-500/10 border-orange-500/30',
    retrying: 'bg-yellow-500/10 border-yellow-500/30',
  };
  return colors[status] || 'bg-gray-500/10 border-gray-500/30';
}