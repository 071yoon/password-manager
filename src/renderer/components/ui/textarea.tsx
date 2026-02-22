import * as React from 'react';
import { cn } from '@/lib/utils';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentPropsWithoutRef<'textarea'>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[92px] w-full rounded-sm border border-slate-300 bg-white/95 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-zinc-600 dark:bg-zinc-800/95 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-700',
      className,
    )}
    {...props}
  />
));

Textarea.displayName = 'Textarea';
