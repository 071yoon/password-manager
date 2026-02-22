import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputGroupVariants = cva('inline-flex items-stretch w-full', {
  variants: {
    variant: {
      default: 'bg-white/95 dark:bg-zinc-800/95',
      secondary: 'bg-white dark:bg-zinc-800',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const inputGroupButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center border border-slate-300/90 text-slate-700 transition dark:border-zinc-600 dark:text-zinc-100',
  {
    variants: {
      variant: {
        default: 'bg-white/95 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700',
        secondary: 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-700 dark:hover:bg-zinc-600',
      },
      size: {
        default: 'h-10 px-3 text-sm',
        'icon-xs': 'h-7 w-7',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
    compoundVariants: [
      {
        size: 'icon-xs',
        class: 'px-0',
      },
    ],
  },
);

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & VariantProps<typeof inputGroupVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} className={cn(inputGroupVariants({ variant }), className)} {...props} />
));

InputGroup.displayName = 'InputGroup';

type InputGroupAddonProps = React.ComponentPropsWithoutRef<'div'> & {
  align?: 'inline-start' | 'inline-end';
};

const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ align = 'inline-start', className, children, ...props }, ref) => {
    const roundedStart = align === 'inline-start' ? 'rounded-sm rounded-r-none' : 'rounded-none';
    const roundedEnd = align === 'inline-end' ? 'rounded-sm rounded-l-none' : 'rounded-none';
    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex shrink-0 overflow-hidden',
          roundedStart,
          roundedEnd,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

InputGroupAddon.displayName = 'InputGroupAddon';

type InputGroupButtonProps = Omit<React.ComponentPropsWithoutRef<'button'>, 'className'> &
  VariantProps<typeof inputGroupButtonVariants> & {
    className?: string;
  };

const InputGroupButton = React.forwardRef<HTMLButtonElement, InputGroupButtonProps>(
  ({ variant, size, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        inputGroupButtonVariants({ variant, size }),
        'border-l-0 [&:first-child]:border-l transition first:rounded-l-none last:rounded-r-none',
        className,
      )}
      {...props}
    />
  ),
);

InputGroupButton.displayName = 'InputGroupButton';

const InputGroupInput = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<'input'>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex min-h-10 w-full rounded-sm border border-slate-300 bg-white/95 px-3 py-2 text-sm text-slate-900 transition',
        'focus:z-10 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200',
        'dark:border-zinc-600 dark:bg-zinc-800/95 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-700',
        className,
      )}
      {...props}
    />
  ),
);

InputGroupInput.displayName = 'InputGroupInput';

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput };
