import { MetricsPanel } from '@/components/MetricsPanel';

export const dynamic = 'force-dynamic';

export default function MetricsPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Metricas</h1>
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api-docs/`}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800"
        >
          Abrir Swagger ↗
        </a>
      </div>
      <MetricsPanel />
    </section>
  );
}
