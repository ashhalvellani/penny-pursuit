import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { formatCurrency } from '../../lib/format';

const PALETTE = [
  '#10b981',
  '#6366f1',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
  '#8b5cf6',
  '#ef4444',
  '#84cc16',
  '#0ea5e9',
  '#f43f5e',
  '#a855f7',
  '#64748b',
];

export function CategoryDonut({ summary, isLoading }) {
  if (isLoading) {
    return (
      <Card className="col-span-12 md:col-span-4 flex flex-col">
        <CardHeader>
          <CardTitle>By category</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          <Skeleton className="h-40 w-40 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  const data = (summary?.byCategory || []).slice(0, 8);
  const total = summary?.total ?? 0;

  return (
    <Card className="col-span-12 md:col-span-4 flex flex-col">
      <CardHeader>
        <CardTitle>By category</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center">
        {data.length === 0 ? (
          <div className="grid h-40 place-items-center text-sm text-muted">
            No spend yet
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="relative h-32 w-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="total"
                    nameKey="category"
                    innerRadius={42}
                    outerRadius={60}
                    paddingAngle={2}
                    isAnimationActive={false}
                  >
                    {data.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(v) => formatCurrency(v)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="min-w-0 flex-1 space-y-1 text-xs">
              {data.slice(0, 5).map((d, i) => (
                <li key={d.category} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: PALETTE[i % PALETTE.length] }}
                  />
                  <span className="min-w-0 flex-1 truncate">{d.category}</span>
                  <span className="tabular text-muted">
                    {total ? `${Math.round((d.total / total) * 100)}%` : '0%'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
