import { LogOut, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { ThemeToggle } from '../common/ThemeToggle';
import { useAuthStore } from '../../stores/auth.store';
import { useLogout } from '../../hooks/useAuth';

export function Topbar({ onMenuClick }) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <header className="flex h-14 items-center gap-2 border-b border-border bg-(--color-bg) px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open menu"
        title="Menu"
        onClick={onMenuClick}
        className="lg:hidden"
      >
        <Menu size={18} />
      </Button>

      <div className="flex-1" />

      <ThemeToggle />
      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-xs text-muted">{user.email}</div>
          </div>
          {user.avatarUrl && (
            <img
              src={user.avatarUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="h-8 w-8 rounded-full border border-border"
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={16} />
          </Button>
        </div>
      )}
    </header>
  );
}
