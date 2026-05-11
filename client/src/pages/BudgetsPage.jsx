import { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CategoryBadge } from '../components/expenses/CategoryBadge';
import { CATEGORIES } from '../lib/expense.schema';
import { formatCurrency } from '../lib/format';
import { useBudgets, useUpsertBudget, useDeleteBudget } from '../hooks/useBudgets';
import { useDashboard, currentMonthKey } from '../hooks/useDashboard';

const FMT = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

function shiftMonth(monthKey, delta) {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function labelFor(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  return FMT.format(new Date(y, m - 1, 1));
}

export default function BudgetsPage() {
  const today = useMemo(() => currentMonthKey(), []);
  const [month, setMonth] = useState(today);

  const { data: budgetsData } = useBudgets(month);
  const { data: summary } = useDashboard(month);
  const upsert = useUpsertBudget();
  const remove = useDeleteBudget();

  const byCategory = useMemo(() => {
    const map = new Map();
    for (const b of budgetsData?.items || []) map.set(b.category, b);
    return map;
  }, [budgetsData]);

  const spendByCategory = useMemo(() => {
    const map = new Map();
    for (const r of summary?.byCategory || []) map.set(r.category, r.total);
    return map;
  }, [summary]);

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
          <p className="text-sm text-muted">
            Set a monthly cap per category. We'll show progress on the dashboard.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Previous month"
            onClick={() => setMonth((m) => shiftMonth(m, -1))}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="px-3 text-sm font-medium">{labelFor(month)}</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next month"
            disabled={month === today}
            onClick={() => setMonth((m) => shiftMonth(m, 1))}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="divide-y divide-border">
            {CATEGORIES.filter((c) => c !== 'Income').map((category) => (
              <BudgetRow
                key={category}
                category={category}
                month={month}
                budget={byCategory.get(category)}
                spent={spendByCategory.get(category) || 0}
                onSave={(amount) =>
                  upsert
                    .mutateAsync({ category, month, amount })
                    .then(() => toast.success(`Budget saved for ${category}`))
                    .catch((err) =>
                      toast.error(err?.response?.data?.error || 'Could not save budget')
                    )
                }
                onDelete={(id) =>
                  remove
                    .mutateAsync({ id, month })
                    .then(() => toast.success(`Budget removed for ${category}`))
                }
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BudgetRow({ category, month, budget, spent, onSave, onDelete }) {
  const [draft, setDraft] = useState(budget?.amount ?? '');

  useEffect(() => {
    setDraft(budget?.amount ?? '');
  }, [budget?.amount, month]);

  const dirty = String(draft) !== String(budget?.amount ?? '');
  const valid = draft === '' || (!isNaN(Number(draft)) && Number(draft) >= 0);

  const pct = budget?.amount > 0 ? Math.min(1, spent / budget.amount) : 0;
  const tone =
    !budget ? 'muted' : pct >= 1 ? 'danger' : pct >= 0.85 ? 'warning' : 'accent';

  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <div className="w-44 shrink-0">
        <CategoryBadge category={category} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="tabular">{formatCurrency(spent)} spent</span>
          {budget && (
            <>
              <span>·</span>
              <span className="tabular">
                {Math.round(pct * 100)}% of {formatCurrency(budget.amount)}
              </span>
            </>
          )}
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border/60">
          <div
            className={
              tone === 'danger'
                ? 'h-full bg-danger'
                : tone === 'warning'
                ? 'h-full bg-warning'
                : tone === 'accent'
                ? 'h-full bg-accent'
                : 'h-full bg-transparent'
            }
            style={{ width: `${pct * 100}%` }}
          />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="—"
          className="w-28 text-right tabular"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button
          size="sm"
          variant={dirty ? 'primary' : 'secondary'}
          disabled={!dirty || !valid || draft === ''}
          onClick={() => onSave(Number(draft))}
        >
          Save
        </Button>
        {budget && (
          <Button
            size="icon"
            variant="ghost"
            aria-label="Remove budget"
            onClick={() => onDelete(budget.id || budget._id)}
          >
            <Trash2 size={14} />
          </Button>
        )}
      </div>
    </div>
  );
}
