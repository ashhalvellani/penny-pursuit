import { Coins } from 'lucide-react';
import { cn } from '../../lib/cn';

const SIZES = {
  sm: { box: 'h-7 w-7', icon: 14, text: 'text-base', gap: 'gap-2' },
  md: { box: 'h-9 w-9', icon: 18, text: 'text-xl', gap: 'gap-2.5' },
  lg: { box: 'h-12 w-12', icon: 24, text: 'text-3xl', gap: 'gap-3' },
};

export function Logo({ size = 'md', className, showText = true }) {
  const s = SIZES[size] || SIZES.md;
  return (
    <div className={cn('flex items-center', s.gap, className)}>
      <div
        className={cn(
          'grid place-items-center rounded-xl bg-linear-to-br from-emerald-500 to-emerald-700 text-white shadow-sm shadow-emerald-900/15 ring-1 ring-emerald-700/30',
          s.box
        )}
      >
        <Coins size={s.icon} strokeWidth={2.25} />
      </div>
      {showText && (
        <span
          className={cn(
            'font-display font-normal tracking-tight leading-none',
            s.text
          )}
          style={{ letterSpacing: '-0.02em' }}
        >
          Penny Pursuit
        </span>
      )}
    </div>
  );
}
