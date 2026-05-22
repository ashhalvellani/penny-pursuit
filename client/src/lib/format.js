import { format as fmt } from 'date-fns';

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
  const iso = typeof value === 'string' ? value : new Date(value).toISOString();
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return '';
  return fmt(new Date(y, m - 1, d), pattern);
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
