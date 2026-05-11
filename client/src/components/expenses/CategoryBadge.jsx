import { cn } from '../../lib/cn';

const PALETTE = {
  'Food & Dining': 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  Groceries: 'bg-lime-100 text-lime-900 dark:bg-lime-950 dark:text-lime-200',
  Transport: 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200',
  Shopping: 'bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200',
  Entertainment: 'bg-pink-100 text-pink-900 dark:bg-pink-950 dark:text-pink-200',
  'Bills & Utilities': 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-200',
  Health: 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200',
  Travel: 'bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200',
  Education: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200',
  Subscriptions: 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200',
  Income: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
  Other: 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-200',
};

export function CategoryBadge({ category, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        PALETTE[category] || PALETTE.Other,
        className
      )}
    >
      {category}
    </span>
  );
}
