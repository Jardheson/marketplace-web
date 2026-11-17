import { MetricsPanel } from '@/components/MetricsPanel';

export const dynamic = 'force-dynamic';

export default function MetricsPage() {
  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Metricas</h1>
          <p className="mt-1 text-sm text-muted">
            Indicadores de requisicoes, pedidos e pagamentos em tempo real.
          </p>
        </div>
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api-docs/`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[44px] items-center rounded-xl border border-line-strong px-4 text-sm font-medium transition hover:bg-surface-2"
        >
          Abrir Swagger ↗
        </a>
      </header>
      <MetricsPanel />
    </section>
  );
}
