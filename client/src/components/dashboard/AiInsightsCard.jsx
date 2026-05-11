import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useInsights, useRefreshInsights } from '../../hooks/useInsights';

export function AiInsightsCard({ month }) {
  const { data, isLoading, isError } = useInsights(month);
  const refresh = useRefreshInsights();
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    try {
      await refresh(month);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <Card className="col-span-12 md:col-span-4 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-accent" />
          AI insights
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Regenerate insights"
          title="Regenerate"
          onClick={onRefresh}
          disabled={refreshing || isLoading || !data}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {(isLoading || refreshing) && <Shimmer />}

        {!isLoading && !refreshing && isError && (
          <div className="flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            Could not generate insights. Make sure Ollama is running.
          </div>
        )}

        {!isLoading && !refreshing && data && (
          <AnimatePresence mode="popLayout">
            <ul className="space-y-3">
              {(data.bullets || []).map((b, i) => (
                <motion.li
                  key={i + b.slice(0, 16)}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-2 text-sm leading-snug"
                >
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{b}</span>
                </motion.li>
              ))}
            </ul>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}

function Shimmer() {
  return (
    <div className="space-y-3">
      {[80, 65, 75].map((w, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
          <div
            className="h-3 animate-pulse rounded bg-border/60"
            style={{ width: `${w}%` }}
          />
        </div>
      ))}
    </div>
  );
}
