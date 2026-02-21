import * as React from 'react';
import { cn } from '@/lib/utils';

export const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'rounded-sm border border-slate-300 bg-white shadow-[0_6px_18px_-16px_rgba(0,0,0,0.45)] dark:border-slate-700 dark:bg-slate-900/80',
      className,
    )}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('px-5 py-4 border-b border-slate-100 dark:border-slate-700', className)}
    {...props}
  />
);

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2
    className={cn(
      'text-lg font-semibold text-slate-900 tracking-tight dark:text-slate-100',
      className,
    )}
    {...props}
  />
);

export const CardDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-slate-500 dark:text-slate-300', className)} {...props} />
);

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-5 py-4', className)} {...props} />
);
