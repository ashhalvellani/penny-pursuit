import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { formatCurrency } from '../../lib/format';
import { cn } from '../../lib/cn';

export function MonthHeroCard({ summary, monthLabel, isLoading }) {
  if (isLoading) {
    return (
      <Card className="col-span-12 md:col-span-4 flex flex-col">
        <CardHeader>
          <CardTitle>This month</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="mt-3 h-4 w-32" />
          <Skeleton className="mt-6 h-24 w-full flex-1" />
        </CardContent>
      </Card>
    );
  }

  const total = summary?.total ?? 0;
  const count = summary?.count ?? 0;
  const delta = summary?.deltaVsLastMonth;

  const series = summary?.dailySeries || [];
  const today = new Date();
  const isCurrentMonth =
    series[0]?.date?.slice(0, 7) ===
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const elapsedDays = isCurrentMonth ? today.getDate() : series.length;
  const dailyAvg = elapsedDays > 0 ? total / elapsedDays : 0;
  const activeDays = series.filter((d) => d.total > 0).length;
  const largest = series.reduce((m, d) => (d.total > m ? d.total : m), 0);

  return (
    <Card className="col-span-12 md:col-span-4 flex flex-col">
      <CardHeader>
        <CardTitle>{monthLabel}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div className="tabular text-4xl font-semibold tracking-tight">
          {formatCurrency(total)}
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <DeltaPill delta={delta} />
          <span className="text-muted">
            {count} {count === 1 ? 'transaction' : 'transactions'}
          </span>
        </div>

        <div className="mt-4 min-h-20 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <defs>
                <linearGradient id="hero-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="total"
                stroke="var(--color-accent)"
                strokeWidth={2}
                fill="url(#hero-gradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-xs">
          <Stat label="Daily avg" value={formatCurrency(dailyAvg)} />
          <Stat label="Largest day" value={formatCurrency(largest)} />
          <Stat label="Active days" value={`${activeDays}/${series.length || 0}`} />
        </dl>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="tabular mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

function DeltaPill({ delta }) {
  if (delta == null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-(--color-bg) px-2 py-0.5 text-muted">
        <Minus size={12} /> No prior month
      </span>
    );
  }
  const up = delta > 0;
  const flat = Math.abs(delta) < 0.005;
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  const cls = flat
    ? 'text-[var(--color-muted)] bg-[var(--color-bg)]'
    : up
    ? 'text-[var(--color-danger)] bg-[var(--color-danger)]/10'
    : 'text-[var(--color-accent)] bg-[var(--color-accent)]/10';
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5', cls)}>
      <Icon size={12} />
      {flat ? '0%' : `${(delta * 100).toFixed(1)}%`} vs last month
    </span>
  );
}
