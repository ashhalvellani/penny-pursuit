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
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
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
              <td className="px-4 py-3 text-muted">{formatDate(e.date)}</td>
              <td className="px-4 py-3 font-medium">
                <div>{e.merchant}</div>
                {e.note && <div className="text-xs text-muted">{e.note}</div>}
              </td>
              <td className="px-4 py-3">
                <CategoryBadge category={e.category} />
              </td>
              <td className="px-4 py-3 text-right tabular">
                <div className="inline-flex items-center justify-end gap-1.5">
                  {e.isAnomaly && (
                    <span
                      title="Unusually high vs your 90-day average for this category"
                      className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-1.5 py-0.5 text-[10px] font-medium text-danger"
                    >
                      <AlertTriangle size={10} />
                      anomaly
                    </span>
                  )}
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
  );
}
