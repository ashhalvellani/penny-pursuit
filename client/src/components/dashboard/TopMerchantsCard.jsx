import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { formatCurrency } from '../../lib/format';

export function TopMerchantsCard({ summary, isLoading }) {
  if (isLoading) {
    return (
      <Card className="col-span-12 md:col-span-4 flex flex-col">
        <CardHeader>
          <CardTitle>Top merchants</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="mb-2 h-7 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const items = summary?.byMerchant || [];
  const max = items[0]?.total || 1;

  return (
    <Card className="col-span-12 md:col-span-4 flex flex-col">
      <CardHeader>
        <CardTitle>Top merchants</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center">
        {items.length === 0 ? (
          <div className="grid h-32 place-items-center text-sm text-muted">
            No merchants yet
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((m) => (
              <li key={m.merchant} className="relative">
                <div
                  className="absolute inset-y-0 left-0 rounded-md bg-accent/10"
                  style={{ width: `${(m.total / max) * 100}%` }}
                />
                <div className="relative flex items-center justify-between px-2 py-2 text-sm">
                  <span className="min-w-0 truncate font-medium">{m.merchant}</span>
                  <span className="tabular text-muted">
                    {formatCurrency(m.total)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
