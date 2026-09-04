// Jest Setup
import '@testing-library/jest-dom';
import React from 'react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return '/dashboard';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock Supabase
const buildSupabaseQuery = () => ({
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: null, error: null }),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
});

const mockSupabaseQuery = buildSupabaseQuery();
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    signUp: jest.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
    signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
    updateUser: jest.fn().mockResolvedValue({ error: null }),
    resend: jest.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  },
  from: jest.fn(() => mockSupabaseQuery),
};

const mockServerSupabaseClient = {
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
  },
  from: jest.fn(() => mockSupabaseQuery),
};

jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => mockSupabaseClient,
  createServerSupabaseClient: () => mockServerSupabaseClient,
}));

// Mock lucide-react
jest.mock('lucide-react', () => {
  const icons: Record<string, any> = {};
  const iconNames = [
    'Mail', 'Lock', 'User', 'AlertCircle', 'CheckCircle', 'Eye', 'EyeOff',
    'Plus', 'Search', 'Filter', 'ArrowRight', 'MoreVertical', 'Settings',
    'Target', 'FileText', 'Play', 'Zap', 'Activity', 'Clock', 'CheckCircle',
    'XCircle', 'BarChart3', 'TrendingUp', 'Award', 'Download', 'RefreshCw',
    'Key', 'Database', 'Terminal', 'Palette', 'Trash2', 'Shield', 'Bell',
    'Globe', 'Code2', 'Brain', 'ArrowLeft', 'LogOut', 'Menu', 'X',
    'Save', 'Home', 'Dashboard', 'Users', 'ChevronRight',
  ];
  iconNames.forEach(name => {
    icons[name] = ({ className, ...props }: any) => React.createElement('svg', { className, ...props, 'data-testid': name.toLowerCase() });
  });
  return icons;
});

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement('div', props, children),
    span: ({ children, ...props }: any) => React.createElement('span', props, children),
    button: ({ children, ...props }: any) => React.createElement('button', props, children),
  },
  AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
}));

// Mock zustand
jest.mock('zustand', () => ({
  create: (fn: any) => {
    let state = fn(() => state, () => state, () => state);
    return () => state;
  },
  devtools: (fn: any) => fn,
  persist: (fn: any) => fn,
}));

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (args[0]?.includes?.('Warning: ReactDOM.render is no longer supported')) return;
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});