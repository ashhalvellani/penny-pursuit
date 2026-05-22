import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { api } from '../../lib/api';
import { cn } from '../../lib/cn';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = 'image/jpeg,image/png';

export function ReceiptUpload({ onExtracted }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  function pick(f) {
    if (!f) return;
    if (f.type !== 'image/jpeg' && f.type !== 'image/png') {
      setError('Only JPEG or PNG images are supported');
      return;
    }
    if (f.size > MAX_BYTES) {
      setError('Image must be under 5 MB');
      return;
    }
    setError(null);
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    pick(e.dataTransfer.files?.[0]);
  }

  function clear() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function extract() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('image', file);
      const { data } = await api.post('/api/ai/receipt', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onExtracted(data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not extract from receipt');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {!file ? (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors',
            isDragging
              ? 'border-accent bg-accent/5'
              : 'border-border hover:border-muted'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={(e) => pick(e.target.files?.[0])}
          />
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-card text-muted">
            <Upload size={18} />
          </div>
          <div className="text-sm font-medium">Drop a receipt photo or click to choose</div>
          <div className="text-xs text-muted">JPEG or PNG · up to 5 MB</div>
        </label>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-3">
          <div className="flex items-start gap-3">
            <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-(--color-bg)">
              {previewUrl ? (
                <img src={previewUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon size={20} className="text-muted" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{file.name}</div>
              <div className="text-xs text-muted">
                {(file.size / 1024).toFixed(0)} KB · {file.type}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button onClick={extract} disabled={loading} size="sm">
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Extracting…
                    </>
                  ) : (
                    'Extract fields'
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={clear} disabled={loading}>
                  Choose different
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-dashed border-accent/40 bg-accent/5 px-3 py-2 text-xs text-accent"
        >
          Reading receipt — this can take 5–15 seconds.
        </motion.div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
