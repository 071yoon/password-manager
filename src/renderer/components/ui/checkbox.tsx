import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-slate-300 bg-white text-slate-900 shadow-sm transition',
      'ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
      'data-[state=checked]:border-slate-900 data-[state=checked]:bg-slate-900 data-[state=checked]:text-slate-50',
      'dark:border-slate-600 dark:bg-slate-900 dark:ring-offset-slate-900',
      'dark:data-[state=checked]:border-slate-100 dark:data-[state=checked]:bg-slate-100 dark:data-[state=checked]:text-slate-900',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center">
      <Check className="h-3 w-3" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
