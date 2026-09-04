// Button Component
import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, iconPosition = 'left', children, asChild, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_10px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)]',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
      ghost: 'hover:bg-muted hover:text-foreground',
      danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-border bg-transparent hover:bg-muted',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10',
    };

    const Comp = asChild ? 'span' : 'button';

    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : icon && iconPosition === 'left' ? (
          <span className="mr-2">{icon}</span>
        ) : null}
        {children}
        {icon && iconPosition === 'right' && !loading && (
          <span className="ml-2">{icon}</span>
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';