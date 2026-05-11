import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  LogOut,
  Trash2,
  Download,
  Sun,
  Moon,
  Monitor,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../stores/auth.store';
import { useThemeStore } from '../stores/theme.store';
import { useLogout } from '../hooks/useAuth';
import { exportExpensesCsv } from '../hooks/useExpenses';
import { api } from '../lib/api';
import { cn } from '../lib/cn';
import { confirm } from '../stores/confirm.store';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      await exportExpensesCsv({});
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Export failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteAllExpenses() {
    const ok = await confirm({
      title: 'Delete all expenses?',
      body: 'Every transaction in your account will be permanently removed. Your budgets and account stay intact.',
      confirmText: 'Delete all expenses',
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      const { data } = await api.delete('/api/expenses');
      qc.invalidateQueries();
      toast.success(`Deleted ${data.deleted} expense${data.deleted === 1 ? '' : 's'}`);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not delete');
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteAccount() {
    const ok = await confirm({
      title: 'Delete your account?',
      body: 'Your account, every expense, and every budget will be wiped. You will be signed out immediately.',
      confirmText: 'Delete account',
      danger: true,
    });
    if (!ok) return;
    const reallySure = await confirm({
      title: 'Last chance.',
      body: 'This is permanent. There is no recovery.',
      confirmText: 'I understand, delete it',
      danger: true,
    });
    if (!reallySure) return;
    setBusy(true);
    try {
      await api.delete('/api/auth/me');
      qc.clear();
      window.location.assign('/login');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not delete account');
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Account, theme, and data controls.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              {user?.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-12 w-12 shrink-0 rounded-full border border-border"
                />
              )}
              <div className="min-w-0">
                <div className="truncate font-medium">{user?.name || 'Signed in'}</div>
                <div className="truncate text-sm text-muted">{user?.email}</div>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              <LogOut size={14} />
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="inline-flex rounded-xl border border-border bg-(--color-bg)text-sm">
            <ThemeOption
              active={theme === 'light'}
              onClick={() => setTheme('light')}
              icon={Sun}
            >
              Light
            </ThemeOption>
            <ThemeOption
              active={theme === 'dark'}
              onClick={() => setTheme('dark')}
              icon={Moon}
            >
              Dark
            </ThemeOption>
            <ThemeOption
              active={theme === 'system'}
              onClick={() => setTheme('system')}
              icon={Monitor}
            >
              System
            </ThemeOption>
          </div>
          <p className="mt-3 text-xs text-muted">
            "System" follows your operating system's appearance setting.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Button variant="secondary" onClick={handleExport} disabled={busy}>
              <Download size={14} />
              Export all expenses as CSV
            </Button>
            <p className="mt-2 text-xs text-muted">
              Download every transaction in your account as a single CSV file.
            </p>
          </div>

          <div className="rounded-xl border border-danger/30 bg-danger/5 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-danger">
              <AlertTriangle size={14} />
              Danger zone
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="danger"
                onClick={handleDeleteAllExpenses}
                disabled={busy}
              >
                <Trash2 size={14} />
                Delete all expenses
              </Button>
              <Button variant="danger" onClick={handleDeleteAccount} disabled={busy}>
                <Trash2 size={14} />
                Delete account
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted">
              "Delete all expenses" keeps your account and budgets. "Delete account"
              wipes everything and signs you out.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ThemeOption({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors',
        active
          ? 'bg-card text-fg shadow-sm'
          : 'text-muted hover:text-fg'
      )}
    >
      <Icon size={14} />
      {children}
    </button>
  );
}
