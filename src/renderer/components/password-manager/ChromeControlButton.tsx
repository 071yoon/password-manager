import * as React from 'react';

import { cn } from '../../lib/utils';

export const chromeControlButtonClass =
  'inline-flex h-8 items-center rounded-sm border border-slate-300/75 bg-white/88 px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-white/78 data-[state=open]:bg-white/78 dark:border-zinc-600/80 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:data-[state=open]:bg-zinc-700';

type ChromeControlButtonProps = React.ComponentPropsWithoutRef<'button'>;

export const ChromeControlButton = React.forwardRef<HTMLButtonElement, ChromeControlButtonProps>(
  ({ className, type = 'button', ...props }, ref) => {
    return <button ref={ref} type={type} className={cn(chromeControlButtonClass, className)} {...props} />;
  },
);

ChromeControlButton.displayName = 'ChromeControlButton';
