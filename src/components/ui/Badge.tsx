import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'emerald' | 'rose' | 'amber' | 'blue';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        {
          'bg-surface-3 text-foreground': variant === 'default',
          'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20': variant === 'emerald',
          'bg-accent-rose/10 text-accent-rose border border-accent-rose/20': variant === 'rose',
          'bg-accent-amber/10 text-accent-amber border border-accent-amber/20': variant === 'amber',
          'bg-accent-blue/10 text-accent-blue border border-accent-blue/20': variant === 'blue',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
