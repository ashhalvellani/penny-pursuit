import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PiggyBank, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CategoryBadge } from '../expenses/CategoryBadge';
import { Skeleton } from '../ui/skeleton';
import { formatCurrency } from '../../lib/format';
import { useBudgets } from '../../hooks/useBudgets';

export function BudgetProgressCard({ summary, month, isLoading }) {
  const { data: budgetsData, isLoading: budgetsLoading } = useBudgets(month);

  const rows = useMemo(() => {
    if (!budgetsData) return [];
    const spendByCat = new Map();
    for (const r of summary?.byCategory || []) spendByCat.set(r.category, r.total);
    return (budgetsData.items || [])
      .map((b) => {
        const spent = spendByCat.get(b.category) || 0;
        const pct = b.amount > 0 ? spent / b.amount : 0;
        return { ...b, spent, pct };
      })
      .sort((a, b) => b.pct - a.pct);
  }, [budgetsData, summary]);

  const loading = isLoading || budgetsLoading;

  if (loading) {
    return (
      <Card className="col-span-12">
        <CardHeader>
          <CardTitle>Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="mb-3 h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <Card className="col-span-12">
        <CardHeader>
          <CardTitle>Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
              <PiggyBank size={18} />
            </div>
            <div className="mt-3 text-sm font-medium">No budgets set yet</div>
            <div className="mt-1 max-w-[40ch] text-xs text-muted">
              Set a monthly cap per category to track progress and get a soft alert when you cross 85%.
            </div>
            <Link
              to="/budgets"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
            >
              Set a budget
              <ArrowRight size={12} />
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-12">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Budgets</CardTitle>
        <Link
          to="/budgets"
          className="text-xs font-medium text-muted hover:text-fg"
        >
          Manage
        </Link>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {rows.map((r) => (
            <BudgetBar key={r.id || r._id} row={r} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function BudgetBar({ row }) {
  const pctClamped = Math.min(1, row.pct);
  const tone = row.pct >= 1 ? 'danger' : row.pct >= 0.85 ? 'warning' : 'accent';
  const barClass =
    tone === 'danger'
      ? 'bg-[var(--color-danger)]'
      : tone === 'warning'
      ? 'bg-[var(--color-warning)]'
      : 'bg-[var(--color-accent)]';

  return (
    <li>
      <div className="mb-1 flex items-center justify-between text-xs">
        <CategoryBadge category={row.category} />
        <div className="tabular text-muted">
          <span className="font-medium text-fg">{formatCurrency(row.spent)}</span>
          {' '}/ {formatCurrency(row.amount)} ·{' '}
          <span className={tone === 'danger' ? 'text-danger font-medium' : ''}>
            {Math.round(row.pct * 100)}%
          </span>
        </div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-border/60">
        <div className={`h-full ${barClass}`} style={{ width: `${pctClamped * 100}%` }} />
      </div>
    </li>
  );
}
