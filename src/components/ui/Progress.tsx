import { cn } from '../../utils/cn';

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  formatValue?: (value: number, max: number) => string;
}

export function Progress({
  className,
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  showValue = false,
  formatValue = (value, max) => `${Math.round((value / max) * 100)}%`,
  ...props
}: ProgressProps) {
  const percentage = (value / max) * 100;

  const variants = {
    default: 'bg-gray-500',
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    error: 'bg-error-600',
  };

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="w-full" {...props}>
      <div className={cn(
        'w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
        sizes[size],
        className
      )}>
        <div
          className={cn('rounded-full transition-all', variants[variant])}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {showValue && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
          {formatValue(value, max)}
        </div>
      )}
    </div>
  );
}