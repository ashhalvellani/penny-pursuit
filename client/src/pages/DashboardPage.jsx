import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../stores/auth.store';
import { useDashboard, currentMonthKey } from '../hooks/useDashboard';
import { MonthHeroCard } from '../components/dashboard/MonthHeroCard';
import { CategoryDonut } from '../components/dashboard/CategoryDonut';
import { TopMerchantsCard } from '../components/dashboard/TopMerchantsCard';
import { DailySpendChart } from '../components/dashboard/DailySpendChart';
import { AiInsightsCard } from '../components/dashboard/AiInsightsCard';
import { BudgetProgressCard } from '../components/dashboard/BudgetProgressCard';

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

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const today = useMemo(() => currentMonthKey(), []);
  const [month, setMonth] = useState(today);

  const { data, isLoading, isError } = useDashboard(month);
  const monthLabel = labelFor(month);
  const isCurrent = month === today;

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hi {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-sm text-muted">Here's where your money went.</p>
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
          <span className="px-3 text-sm font-medium">{monthLabel}</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next month"
            disabled={isCurrent}
            onClick={() => setMonth((m) => shiftMonth(m, 1))}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {isError && (
        <div className="mb-4 rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          Failed to load dashboard.
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        <MonthHeroCard summary={data} monthLabel={monthLabel} isLoading={isLoading} />
        <CategoryDonut summary={data} isLoading={isLoading} />
        <TopMerchantsCard summary={data} isLoading={isLoading} />
        <DailySpendChart summary={data} isLoading={isLoading} />
        <AiInsightsCard month={month} />
        <BudgetProgressCard summary={data} month={month} isLoading={isLoading} />
      </div>
    </div>
  );
}
