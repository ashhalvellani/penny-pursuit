import { useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Receipt, PiggyBank, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Logo } from '../components/common/Logo';
import { startGoogleLogin, useMe } from '../hooks/useAuth';

export default function LoginPage() {
  const [params] = useSearchParams();
  const error = params.get('error');
  const { data: user, isPending } = useMe();

  useEffect(() => {
    if (error) console.warn('OAuth error:', error);
  }, [error]);

  if (isPending) {
    return (
      <div className="grid h-full place-items-center text-sm text-muted">
        Loading…
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12 lg:px-12">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-32 -left-32 h-120 w-120 rounded-full bg-emerald-300/30 blur-[120px] dark:bg-emerald-500/15" />
        <div className="absolute -bottom-40 right-[-10%] h-130 w-130 rounded-full bg-emerald-200/40 blur-[140px] dark:bg-emerald-700/15" />
      </div>

      <div className="grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Hero — left (desktop only) */}
        <section className="hidden lg:block">
          <Logo size="lg" className="mb-14" />

          <h1
            className="text-[clamp(2.75rem,4.2vw,4rem)] leading-[1.05] tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
            }}
          >
            Track every <span className="italic">penny.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
            An AI-assisted expense tracker that categorizes merchants, extracts
            fields from receipts, and surfaces what's worth your attention this
            month.
          </p>

          <ul className="mt-10 space-y-4">
            <Feature
              icon={Receipt}
              title="Receipt scanning"
              body="Snap a photo. Merchant, total, and date land in your form."
            />
            <Feature
              icon={Sparkles}
              title="AI categorization & insights"
              body="Local-first model classifies merchants and writes monthly highlights."
            />
            <Feature
              icon={PiggyBank}
              title="Budgets with anomaly detection"
              body="Set monthly caps; we flag the outliers so you don't have to."
            />
          </ul>
        </section>

        {/* Card — right */}
        <section className="flex justify-center lg:justify-end">
          <div className="w-full max-w-sm">
            <div className="mb-6 lg:hidden">
              <Logo size="lg" />
            </div>

            <div className="rounded-3xl border border-border bg-card/80 p-8 shadow-xl shadow-emerald-900/5 backdrop-blur-sm">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">Welcome</h2>
                <p className="mt-1 text-sm text-muted">
                  Sign in with Google to start tracking.
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
                  Sign-in failed. Please try again.
                </div>
              )}

              <Button onClick={startGoogleLogin} className="w-full" size="lg">
                <GoogleIcon />
                Continue with Google
              </Button>

              <div className="mt-6 flex items-start gap-2 text-xs text-muted">
                <ShieldCheck size={14} className="mt-0.5 shrink-0" />
                <span>
                  We only use your Google account to identify you. We never see
                  or store your password.
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, body }) {
  return (
    <li className="flex items-start gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-card text-accent">
        <Icon size={16} />
      </div>
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-sm text-muted">{body}</div>
      </div>
    </li>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.6 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5 44.5 36.3 44.5 25c0-1.5-.2-3-.4-4.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.8 15.1 19 12.5 24 12.5c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.6 4.5 24 4.5 16.3 4.5 9.6 8.6 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 45.5c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5c-2 1.4-4.6 2.5-7.6 2.5-5.3 0-9.7-3.4-11.3-8L6.1 33.5C9.4 39.7 16.1 45.5 24 45.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.7-3.7 5l6.5 5.5c-.5.5 7.4-5.4 7.4-15.5 0-1.5-.2-3-.4-4.5z"
      />
    </svg>
  );
}
