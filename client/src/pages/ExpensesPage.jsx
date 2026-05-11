import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Dialog } from '../components/ui/dialog';
import { ExpenseForm } from '../components/expenses/ExpenseForm';
import { ExpenseTable } from '../components/expenses/ExpenseTable';
import { ExpenseFilters } from '../components/expenses/ExpenseFilters';
import { ReceiptUpload } from '../components/expenses/ReceiptUpload';
import { cn } from '../lib/cn';
import {
  useExpenses,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
  exportExpensesCsv,
} from '../hooks/useExpenses';
import { confirm } from '../stores/confirm.store';

const PAGE_SIZE = 25;

export default function ExpensesPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({ page: 1 });
  const [exporting, setExporting] = useState(false);
  const [dialogTab, setDialogTab] = useState('manual');
  const [prefill, setPrefill] = useState(null);

  const { data, isLoading, isError, isFetching } = useExpenses({
    ...filters,
    limit: PAGE_SIZE,
  });
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  function openCreate() {
    setEditing(null);
    setPrefill(null);
    setDialogTab('manual');
    setOpen(true);
  }

  function openEdit(exp) {
    setEditing(exp);
    setPrefill(null);
    setDialogTab('manual');
    setOpen(true);
  }

  function closeDialog() {
    setOpen(false);
    setEditing(null);
    setPrefill(null);
    setDialogTab('manual');
  }

  function handleExtracted(data) {
    setPrefill({
      merchant: data.merchant || '',
      amount: data.amount ?? '',
      date: data.date || new Date().toISOString().slice(0, 10),
      category: data.category || '',
    });
    setDialogTab('manual');
    toast.success('Receipt scanned — review and submit');
  }

  async function handleSubmit(values) {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id || editing._id, ...values });
        toast.success('Expense updated');
      } else {
        await createMutation.mutateAsync(values);
        toast.success('Expense added');
      }
      setOpen(false);
      setEditing(null);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Something went wrong');
    }
  }

  async function handleDelete(exp) {
    const ok = await confirm({
      title: 'Delete this expense?',
      body: `“${exp.merchant}” will be permanently removed from your account.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteMutation.mutateAsync(exp.id || exp._id);
      toast.success('Expense deleted');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not delete');
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      await exportExpensesCsv(filters);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Export failed');
    } finally {
      setExporting(false);
    }
  }

  const total = data?.total ?? 0;
  const page = data?.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
          <p className="text-sm text-muted">All transactions, newest first.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleExport}
            disabled={exporting || (data?.total ?? 0) === 0}
          >
            <Download size={16} />
            {exporting ? 'Exporting…' : 'Export CSV'}
          </Button>
          <Button onClick={openCreate}>
            <Plus size={16} />
            Add expense
          </Button>
        </div>
      </div>

      <ExpenseFilters value={filters} onChange={setFilters} />

      {isLoading ? (
        <div className="rounded-2xl border border-border py-16 text-center text-sm text-muted">
          Loading…
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          Failed to load expenses.
        </div>
      ) : (
        <>
          <ExpenseTable items={data?.items || []} onEdit={openEdit} onDelete={handleDelete} />

          <div className="mt-4 flex items-center justify-between text-xs text-muted">
            <div>
              {total === 0
                ? 'No matching expenses'
                : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
              {isFetching && <span className="ml-2 italic">updating…</span>}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Previous page"
                  disabled={page <= 1}
                  onClick={() => setFilters((f) => ({ ...f, page: page - 1 }))}
                >
                  <ChevronLeft size={16} />
                </Button>
                <span className="tabular px-2">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Next page"
                  disabled={page >= totalPages}
                  onClick={() => setFilters((f) => ({ ...f, page: page + 1 }))}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      <Dialog
        open={open}
        onClose={closeDialog}
        title={editing ? 'Edit expense' : 'Add expense'}
      >
        {!editing && (
          <div className="mb-4 inline-flex rounded-xl border border-border bg-(--color-bg) p-1 text-xs">
            <TabButton active={dialogTab === 'manual'} onClick={() => setDialogTab('manual')}>
              Manual
            </TabButton>
            <TabButton active={dialogTab === 'scan'} onClick={() => setDialogTab('scan')}>
              Scan receipt
            </TabButton>
          </div>
        )}
        {dialogTab === 'scan' && !editing ? (
          <ReceiptUpload onExtracted={handleExtracted} />
        ) : (
          <ExpenseForm
            initial={editing || prefill}
            submitting={createMutation.isPending || updateMutation.isPending}
            onSubmit={handleSubmit}
            onCancel={closeDialog}
          />
        )}
      </Dialog>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg px-3 py-1.5 font-medium transition-colors',
        active
          ? 'bg-card text-fg shadow-sm'
          : 'text-muted hover:text-fg'
      )}
    >
      {children}
    </button>
  );
}
