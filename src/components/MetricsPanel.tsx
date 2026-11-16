'use client';

import { useEffect, useState } from 'react';

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

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${apiBase}/metrics`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        setMetrics(parsePrometheus(text));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar');
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="text-neutral-400">Carregando metricas...</p>;
  if (error)
    return (
      <div className="rounded border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
        Nao foi possivel carregar as metricas: {error}
        <p className="mt-2 text-xs text-neutral-400">
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
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-sm text-neutral-400">Requisicoes totais</p>
          <p className="mt-1 text-2xl font-semibold">
            {Math.round(sumValues(httpTotal)).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-sm text-neutral-400">Erros HTTP</p>
          <p className="mt-1 text-2xl font-semibold text-red-400">
            {Math.round(sumValues(httpErrors)).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-sm text-neutral-400">Pedidos criados</p>
          <p className="mt-1 text-2xl font-semibold text-violet-400">
            {Math.round(sumValues(ordersCreated)).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-sm text-neutral-400">Pagamentos processados</p>
          <p className="mt-1 text-2xl font-semibold text-green-400">
            {Math.round(sumValues(paymentsProcessed)).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
        <h2 className="mb-4 text-lg font-semibold">Todas as metricas</h2>
        <div className="space-y-4">
          {metrics.map((m) => (
            <div key={m.name} className="border-b border-neutral-800 pb-3 last:border-0">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-sm font-medium">{m.name}</span>
                <span className="text-xs text-neutral-500">{m.type}</span>
              </div>
              <p className="mt-0.5 text-xs text-neutral-500">{m.help}</p>
              <div className="mt-2 max-h-32 overflow-auto font-mono text-xs text-neutral-400">
                {m.values.slice(0, 20).map((v, i) => (
                  <div key={i}>
                    {Object.keys(v.labels).length > 0 && (
                      <span className="text-neutral-500">
                        {Object.entries(v.labels)
                          .map(([k, val]) => `${k}=${val}`)
                          .join(', ')}
                        {'  '}
                      </span>
                    )}
                    <span className="text-neutral-200">{v.value}</span>
                  </div>
                ))}
                {m.values.length > 20 && (
                  <p className="text-neutral-600">
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
