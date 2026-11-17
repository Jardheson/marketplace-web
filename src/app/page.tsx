import Link from 'next/link';
import { listProducts } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { Pagination } from '@/components/Pagination';

export const dynamic = 'force-dynamic';

function safePage(pageParam: string | undefined): number {
  const n = Number(pageParam);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) return 1;
  return n;
}

function safeSearch(searchParam: string | undefined): string {
  if (!searchParam) return '';
  return searchParam.slice(0, 100);
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = safePage(params.page);
  const search = safeSearch(params.search);
  const result = await listProducts({ page, pageSize: 12, search });

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-line bg-surface px-6 py-10 sm:px-10 sm:py-14 lg:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
        />
        <div className="relative max-w-2xl space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface-2 px-3 py-1 text-xs font-medium text-muted">
            <span
              className="h-1.5 w-1.5 rounded-full bg-success"
              aria-hidden
            />
            Catalogo sincronizado com a API
          </span>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Tudo o que voce busca, na MERX
          </h1>
          <p className="text-sm text-muted sm:text-base">
            Explore o catalogo completo, monte seu carrinho e finalize o pedido
            em poucos passos.
          </p>
          <form
            className="flex w-full max-w-lg flex-col gap-2 sm:flex-row"
            action="/"
            role="search"
          >
            <label htmlFor="search" className="sr-only">
              Buscar produtos
            </label>
            <input
              id="search"
              name="search"
              defaultValue={search}
              placeholder="Buscar por nome ou SKU..."
              className="input flex-1"
            />
            <button
              type="submit"
              className="flex min-h-[44px] items-center justify-center rounded-xl bg-accent px-5 text-sm font-medium text-white transition hover:bg-accent-hover"
            >
              Buscar
            </button>
          </form>
        </div>
      </section>

      <section className="space-y-5">
        <header className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {search ? `Resultados para "${search}"` : 'Destaques'}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {result.total}{' '}
              {result.total === 1
                ? 'produto disponivel'
                : 'produtos disponiveis'}
            </p>
          </div>
        </header>

        {result.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-surface/50 px-6 py-16 text-center">
            <span
              aria-hidden
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-2xl"
            >
              🔍
            </span>
            <p className="mt-4 font-medium">Nenhum produto encontrado</p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              {search
                ? 'Tente ajustar os termos da busca ou explore o catalogo completo.'
                : 'O catalogo ainda esta vazio. Cadastre produtos pela API para ve-los aqui.'}
            </p>
            {search && (
              <Link
                href="/"
                className="mt-5 flex min-h-[44px] items-center justify-center rounded-xl border border-line-strong px-4 text-sm font-medium transition hover:bg-surface-2"
              >
                Limpar busca
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {result.data.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {result.totalPages > 1 && (
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            basePath="/"
            searchParams={search ? { search } : undefined}
          />
        )}
      </section>
    </div>
  );
}
