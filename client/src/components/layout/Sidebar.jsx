import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, PiggyBank, Settings, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Logo } from '../common/Logo';
import { Button } from '../ui/button';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ open = false, onClose = () => {} }) {
  const location = useLocation();

  // Auto-close the drawer on route change (mobile)
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape (mobile)
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop — mobile only */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      <aside
        className={cn(
          // Mobile: fixed drawer, slides from the left
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card px-4 py-6 transition-transform duration-200 ease-out',
          // Desktop: static, in flow
          'lg:static lg:z-auto lg:w-60 lg:translate-x-0 lg:bg-card/40 lg:py-6',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <Logo size="md" />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close menu"
            onClick={onClose}
            className="lg:hidden"
          >
            <X size={16} />
          </Button>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-(--color-bg) text-fg font-medium'
                    : 'text-muted hover:text-fg hover:bg-(--color-bg)'
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
