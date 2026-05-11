import { AlertTriangle } from 'lucide-react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { useConfirmStore } from '../../stores/confirm.store';

export function ConfirmDialog() {
  const options = useConfirmStore((s) => s.options);
  const close = useConfirmStore((s) => s.close);
  const open = !!options;

  const danger = options?.danger;
  const title = options?.title || 'Are you sure?';
  const body = options?.body;
  const confirmText = options?.confirmText || (danger ? 'Delete' : 'Confirm');
  const cancelText = options?.cancelText || 'Cancel';

  return (
    <Dialog open={open} onClose={() => close(false)} title={title}>
      <div className="space-y-4">
        {danger && (
          <div className="flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            This action can't be undone.
          </div>
        )}
        {body && (
          <p className="text-sm leading-relaxed text-muted">{body}</p>
        )}
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={() => close(false)}>
            {cancelText}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={() => close(true)}
            autoFocus
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
