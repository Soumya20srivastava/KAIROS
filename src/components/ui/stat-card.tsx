// StatCard Component
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
  loading?: boolean;
}

export function StatCard({ title, value, icon, trend, className, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className={cn('nerv-panel p-4', className)}>
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-8 w-16 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className={cn('nerv-panel p-4', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-orbitron text-3xl font-bold text-foreground">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium',
              trend.value >= 0 ? 'text-green-400' : 'text-red-400'
            )}
          >
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      {trend && (
        <p className="mt-1 text-xs text-muted-foreground">{trend.label}</p>
      )}
    </div>
  );
}