import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, Loader2, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input, Select, Label } from '../ui/input';
import { CATEGORIES, expenseFormSchema, defaultFormValues } from '../../lib/expense.schema';
import { api } from '../../lib/api';
import { cn } from '../../lib/cn';

export function ExpenseForm({ initial, onSubmit, onCancel, submitting }) {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: initial ? toFormValues(initial) : defaultFormValues(),
  });

  const [aiCategory, setAiCategory] = useState(null);
  const [aiConfidence, setAiConfidence] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    reset(initial ? toFormValues(initial) : defaultFormValues());
    setAiCategory(null);
    setAiConfidence(null);
    setAiError(null);
  }, [initial, reset]);

  const watchedCategory = useWatch({ control, name: 'category' });
  const showAiBadge = aiCategory && watchedCategory === aiCategory;

  const merchantReg = register('merchant');

  async function handleMerchantBlur(e) {
    merchantReg.onBlur(e);
    const merchant = e.target.value.trim();
    if (!merchant) return;
    if (getValues('category')) return;
    if (initial) return;

    setAiLoading(true);
    setAiError(null);
    try {
      const { data } = await api.post('/api/ai/categorize', { merchant });
      if (CATEGORIES.includes(data.category)) {
        setValue('category', data.category, { shouldValidate: true, shouldDirty: true });
        setAiCategory(data.category);
        setAiConfidence(data.confidence);
      }
    } catch {
      setAiError('AI suggestion failed');
    } finally {
      setAiLoading(false);
    }
  }

  function dismissAi() {
    setAiCategory(null);
    setAiConfidence(null);
    setValue('category', '', { shouldValidate: false });
  }

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) => {
        onSubmit({
          ...values,
          amount: Number(values.amount),
          note: values.note?.trim() || undefined,
        });
      })}
    >
      <Field label="Merchant" error={errors.merchant?.message}>
        <Input
          placeholder="e.g. Chipotle"
          autoFocus
          {...merchantReg}
          onBlur={handleMerchantBlur}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount" error={errors.amount?.message}>
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register('amount')}
          />
        </Field>
        <Field label="Date" error={errors.date?.message}>
          <Input type="date" {...register('date')} />
        </Field>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <Label>Category</Label>
          {aiLoading && (
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <Loader2 size={12} className="animate-spin" />
              AI is thinking…
            </span>
          )}
          {showAiBadge && !aiLoading && (
            <button
              type="button"
              onClick={dismissAi}
              className={cn(
                'inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent hover:bg-accent/20'
              )}
              title="Click to clear AI suggestion"
            >
              <Sparkles size={10} />
              AI
              {aiConfidence != null && (
                <span className="tabular text-muted">
                  {Math.round(aiConfidence * 100)}%
                </span>
              )}
              <X size={10} />
            </button>
          )}
        </div>
        <Select {...register('category')}>
          <option value="">Select a category…</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        {errors.category?.message && (
          <div className="mt-1 text-xs text-danger">{errors.category.message}</div>
        )}
        {aiError && !aiLoading && (
          <div className="mt-1 text-xs text-muted">{aiError} — pick manually</div>
        )}
      </div>

      <Field label="Note (optional)" error={errors.note?.message}>
        <Input placeholder="Anything to remember" {...register('note')} />
      </Field>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add expense'}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <Label className="mb-1 block">{label}</Label>
      {children}
      {error && <div className="mt-1 text-xs text-danger">{error}</div>}
    </div>
  );
}

function toFormValues(exp) {
  return {
    merchant: exp.merchant ?? '',
    amount: exp.amount ?? '',
    date: (exp.date ? new Date(exp.date) : new Date()).toISOString().slice(0, 10),
    category: exp.category ?? '',
    note: exp.note ?? '',
  };
}
