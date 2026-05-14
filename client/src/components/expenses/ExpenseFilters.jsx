import { Search, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input, Select } from '../ui/input';
import { CATEGORIES } from '../../lib/expense.schema';

export function ExpenseFilters({ value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch, page: 1 });

  const isActive =
    value.q || value.category || value.from || value.to;

  return (
    <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-[1fr_auto_auto_auto_auto]">
      <div className="relative col-span-2 md:col-span-1">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <Input
          className="pl-9"
          type="search"
          placeholder="Search merchant or note…"
          value={value.q || ''}
          onChange={(e) => set({ q: e.target.value })}
        />
      </div>

      <Select
        className="col-span-2 md:col-span-1 md:w-44"
        value={value.category || ''}
        onChange={(e) => set({ category: e.target.value })}
      >
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>

      <label className="block">
        <span className="mb-1 block text-xs text-muted md:hidden">From</span>
        <Input
          className="w-full md:w-40"
          type="date"
          value={value.from || ''}
          onChange={(e) => set({ from: e.target.value })}
          aria-label="From date"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-muted md:hidden">To</span>
        <Input
          className="w-full md:w-40"
          type="date"
          value={value.to || ''}
          onChange={(e) => set({ to: e.target.value })}
          aria-label="To date"
        />
      </label>

      {isActive && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Clear filters"
          className="col-span-2 w-full md:col-span-1 md:w-9"
          onClick={() => onChange({ page: 1 })}
        >
          <X size={16} />
        </Button>
      )}
    </div>
  );
}
