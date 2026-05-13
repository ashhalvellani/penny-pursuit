import { Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { CategoryBadge } from './CategoryBadge';
import { formatCurrency, formatDate } from '../../lib/format';

export function ExpenseTable({ items, onEdit, onDelete }) {
  if (!items?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted">
        No expenses yet. Add one to get started.
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-muted">
            <tr className="border-b border-border">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Merchant</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 text-right font-medium" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <tr
                key={e.id || e._id}
                className="border-b border-border last:border-b-0 hover:bg-(--color-bg)"
              >
                <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(e.date)}</td>
                <td className="px-4 py-3 font-medium">
                  <div>{e.merchant}</div>
                  {e.note && <div className="text-xs text-muted">{e.note}</div>}
                </td>
                <td className="px-4 py-3">
                  <CategoryBadge category={e.category} />
                </td>
                <td className="px-4 py-3 text-right tabular">
                  <div className="inline-flex items-center justify-end gap-1.5">
                    {e.isAnomaly && <AnomalyBadge />}
                    <span>{formatCurrency(e.amount, e.currency)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Edit"
                      onClick={() => onEdit(e)}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete"
                      onClick={() => onDelete(e)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <ul className="space-y-2 md:hidden">
        {items.map((e) => (
          <li
            key={e.id || e._id}
            className="rounded-2xl border border-border bg-card px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{e.merchant}</div>
                {e.note && (
                  <div className="truncate text-xs text-muted">{e.note}</div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {e.isAnomaly && <AnomalyBadge />}
                <span className="tabular text-sm font-medium">
                  {formatCurrency(e.amount, e.currency)}
                </span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <CategoryBadge category={e.category} />
                <span className="whitespace-nowrap text-xs text-muted">
                  {formatDate(e.date)}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-0.5 -mr-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Edit"
                  onClick={() => onEdit(e)}
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete"
                  onClick={() => onDelete(e)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function AnomalyBadge() {
  return (
    <span
      title="Unusually high vs your 90-day average for this category"
      className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-1.5 py-0.5 text-[10px] font-medium text-danger"
    >
      <AlertTriangle size={10} />
      anomaly
    </span>
  );
}
