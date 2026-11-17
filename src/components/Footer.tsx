import Link from 'next/link';

const apiBase =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-xs font-bold text-white"
          >
            M
          </span>
          <span>
            MERX &copy; {new Date().getFullYear()}
          </span>
        </div>
        <nav aria-label="Rodape" className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/orders" className="transition hover:text-ink">
            Pedidos
          </Link>
          <Link href="/payments" className="transition hover:text-ink">
            Pagamentos
          </Link>
          <Link href="/metrics" className="transition hover:text-ink">
            Metricas
          </Link>
          <a
            href={`${apiBase}/api-docs/`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-ink"
          >
            API OpenAPI ↗
          </a>
        </nav>
      </div>
    </footer>
  );
}
