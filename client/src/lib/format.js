import { format as fmt, parseISO } from 'date-fns';

export function formatCurrency(amount, currency = 'USD') {
  if (amount == null || isNaN(amount)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(value, pattern = 'MMM d, yyyy') {
  if (!value) return '';
  const d = typeof value === 'string' ? parseISO(value) : value;
  return fmt(d, pattern);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
