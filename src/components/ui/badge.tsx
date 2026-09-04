// Badge Component
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { getStatusColor, getStatusBgColor } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  status?: string;
  variant?: 'default' | 'status' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  pulse?: boolean;
}

export function Badge({ children, status, variant = 'default', size = 'md', className, pulse = true }: BadgeProps) {
  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  const pulseSizes = {
    sm: 'h-1 w-1',
    md: 'h-1.5 w-1.5',
    lg: 'h-2 w-2',
  };

  if (variant === 'status' && status) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-medium border',
          getStatusBgColor(status),
          getStatusColor(status),
          sizes[size],
          className
        )}
      >
        {pulse && (
          <span
            className={cn(
              'rounded-full',
              pulseSizes[size],
              status === 'completed' && 'bg-green-400',
              status === 'running' && 'bg-cyan-400',
              status === 'pending' && 'bg-yellow-400',
              status === 'failed' && 'bg-red-400',
              status === 'cancelled' && 'bg-gray-400'
            )}
          />
        )}
        <span className="capitalize">{children}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        'bg-muted text-muted-foreground border border-border',
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}