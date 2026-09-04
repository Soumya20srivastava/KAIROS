// Card Component
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

export function Card({ children, className, header, footer, padding = 'md' }: CardProps) {
  const paddings = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    none: '',
  };

  return (
    <div
      className={cn(
        'nerv-panel rounded-lg',
        'animate-fade-in',
        paddings[padding],
        className
      )}
    >
      {header && (
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
          {header}
        </div>
      )}
      {children}
      {footer && (
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          {footer}
        </div>
      )}
    </div>
  );
}