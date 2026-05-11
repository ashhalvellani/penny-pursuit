import { cn } from '../../lib/cn';

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-[var(--color-border)]/60',
        className
      )}
    />
  );
}
