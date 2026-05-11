import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { formatCurrency } from '../../lib/format';

export function DailySpendChart({ summary, isLoading }) {
  if (isLoading) {
    return (
      <Card className="col-span-12 md:col-span-8">
        <CardHeader>
          <CardTitle>Daily spend</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-56 w-full" />
        </CardContent>
      </Card>
    );
  }

  const data = (summary?.dailySeries || []).map((d) => ({
    ...d,
    label: d.date.slice(8),
  }));

  return (
    <Card className="col-span-12 md:col-span-8">
      <CardHeader>
        <CardTitle>Daily spend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -10, right: 8, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="daily-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
                interval="preserveStartEnd"
                minTickGap={20}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
                width={48}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(v) => formatCurrency(v)}
                labelFormatter={(l, payload) => payload?.[0]?.payload?.date || l}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="var(--color-accent)"
                strokeWidth={2}
                fill="url(#daily-gradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
