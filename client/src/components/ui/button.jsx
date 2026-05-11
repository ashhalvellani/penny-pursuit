import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const buttonStyles = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-accent)] text-[var(--color-accent-fg)] hover:opacity-90',
        secondary:
          'bg-[var(--color-card)] text-[var(--color-fg)] border border-[var(--color-border)] hover:bg-[color-mix(in_oklch,var(--color-card)_90%,var(--color-fg))]',
        ghost:
          'text-[var(--color-fg)] hover:bg-[var(--color-card)]',
        danger:
          'bg-[var(--color-danger)] text-white hover:opacity-90',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-11 px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export const Button = forwardRef(function Button(
  { className, variant, size, type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonStyles({ variant, size }), className)}
      {...props}
    />
  );
});
