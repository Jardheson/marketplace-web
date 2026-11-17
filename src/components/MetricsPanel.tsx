'use client';

import { useEffect, useState, useRef } from 'react';

interface Metric {
  name: string;
  help: string;
  type: string;
  values: { labels: Record<string, string>; value: string }[];
}

function parsePrometheus(text: string): Metric[] {
  const metrics: Metric[] = [];
  const lines = text.split('\n');
  let current: Metric | null = null;

  for (const line of lines) {
    if (!line || line.startsWith('# TYPE')) {
      const match = line.match(/# TYPE (\w+) (\w+)/);
      if (match && current) {
        current.type = match[2];
      }
      continue;
    }
    if (line.startsWith('# HELP')) {
      const match = line.match(/# HELP (\w+) (.+)/);
      if (match) {
        current = { name: match[1], help: match[2], type: '', values: [] };
        metrics.push(current);
      }
      continue;
    }
    if (!current) continue;

    const labelMatch = line.match(/^(\w+){([^}]*)\}\s+(.+)$/);
    const simpleMatch = line.match(/^(\w+)\s+(.+)$/);

    if (labelMatch) {
      const labels: Record<string, string> = {};
      labelMatch[2].split(',').forEach((pair) => {
        const [k, v] = pair.split('=');
        if (k && v) labels[k.trim()] = v.replace(/"/g, '').trim();
      });
      current.values.push({ labels, value: labelMatch[3] });
    } else if (simpleMatch) {
      current.values.push({ labels: {}, value: simpleMatch[2] });
    }
  }

  return metrics;
}

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export function MetricsPanel() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (document.hidden) return;
      try {
        const res = await fetch(`${apiBase}/metrics`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        if (mounted) {
          setMetrics(parsePrometheus(text));
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    function startInterval() {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(load, 15000);
    }
    function stopInterval() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    startInterval();

    function onVisibility() {
      if (document.hidden) {
        stopInterval();
      } else {
        load();
        startInterval();
      }
    }
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      mounted = false;
      stopInterval();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  if (loading)
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl border border-line bg-surface skeleton"
            />
          ))}
        </div>
        <div className="h-64 rounded-2xl border border-line bg-surface skeleton" />
      </div>
    );

  if (error)
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger"
      >
        Nao foi possivel carregar as metricas: {error}
        <p className="mt-2 text-xs text-muted">
          Verifique se a API esta rodando em {apiBase} e se CORS esta
          habilitado.
        </p>
      </div>
    );

  const httpTotal = metrics.find((m) => m.name === 'http_requests_total');
  const httpErrors = metrics.find((m) => m.name === 'http_errors_total');
  const ordersCreated = metrics.find((m) => m.name === 'orders_created_total');
  const paymentsProcessed = metrics.find(
    (m) => m.name === 'payments_processed_total',
  );

  function sumValues(m?: Metric) {
    if (!m) return 0;
    return m.values.reduce((s, v) => s + Number(v.value), 0);
  }

  return (
    <div className="space-y-6" aria-live="polite">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h3 className="text-sm font-medium text-muted">Requisicoes totais</h3>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {Math.round(sumValues(httpTotal)).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h3 className="text-sm font-medium text-muted">Erros HTTP</h3>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-danger">
            {Math.round(sumValues(httpErrors)).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h3 className="text-sm font-medium text-muted">Pedidos criados</h3>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-accent">
            {Math.round(sumValues(ordersCreated)).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h3 className="text-sm font-medium text-muted">
            Pagamentos processados
          </h3>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-success">
            {Math.round(sumValues(paymentsProcessed)).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold">Todas as metricas</h2>
        <div className="space-y-4">
          {metrics.map((m) => (
            <div
              key={m.name}
              className="border-b border-line pb-3 last:border-0"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-mono text-sm font-medium">
                  {m.name}
                </span>
                <span className="text-xs text-muted">{m.type}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted">{m.help}</p>
              <div className="mt-2 max-h-32 overflow-auto font-mono text-xs text-muted">
                {m.values.slice(0, 20).map((v, i) => (
                  <div key={i}>
                    {Object.keys(v.labels).length > 0 && (
                      <span className="text-faint">
                        {Object.entries(v.labels)
                          .map(([k, val]) => `${k}=${val}`)
                          .join(', ')}
                        {'  '}
                      </span>
                    )}
                    <span className="text-ink tabular-nums">{v.value}</span>
                  </div>
                ))}
                {m.values.length > 20 && (
                  <p className="text-faint">
                    ... e mais {m.values.length - 20} series
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
