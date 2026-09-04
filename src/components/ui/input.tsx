// Input Component
import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helper?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  onIconClick?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, helper, icon, iconPosition = 'right', onIconClick, id, ...props }, ref) => {
    const IconWrapper = onIconClick ? 'button' : 'span';

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            className={cn(
              'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm',
              'ring-offset-background placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50',
              icon && (iconPosition === 'left' ? 'pl-10' : 'pr-10'),
              error
                ? 'border-destructive focus-visible:ring-destructive'
                : 'border-input focus-visible:ring-primary',
              className
            )}
            {...props}
          />
          {icon && (
            <IconWrapper
              type={onIconClick ? 'button' : undefined}
              onClick={onIconClick}
              className={cn(
                'absolute top-1/2 -translate-y-1/2 text-muted-foreground',
                iconPosition === 'left' ? 'left-3' : 'right-3',
                onIconClick && 'hover:text-foreground cursor-pointer'
              )}
            >
              {icon}
            </IconWrapper>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        {helper && !error && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';