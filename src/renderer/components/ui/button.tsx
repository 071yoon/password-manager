import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-slate-900 text-white hover:bg-slate-800 shadow-sm dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200',
        secondary:
          'border border-slate-300 bg-white text-slate-800 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
        ghost:
          'bg-slate-100/90 text-slate-800 hover:bg-slate-200/70 dark:bg-slate-800/90 dark:text-slate-100 dark:hover:bg-slate-700/80',
        danger:
          'bg-rose-600 text-white hover:bg-rose-500 shadow-sm dark:bg-rose-600 dark:hover:bg-rose-500',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-9 px-3',
        lg: 'h-11 px-6',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);

Button.displayName = 'Button';
