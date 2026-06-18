import * as React from 'react';
import { cn } from '../../utils';
import { cva } from 'class-variance-authority';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary-100 text-primary-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
        muted: 'bg-slate-100 text-slate-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
  style?: React.CSSProperties;
}

function Badge({ className, variant = 'default', children, onClick, style }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} onClick={onClick} style={style}>
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
