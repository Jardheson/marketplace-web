import { listProducts } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { Pagination } from '@/components/Pagination';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? '1');
  const search = params.search ?? '';
  const result = await listProducts({ page, pageSize: 12, search });

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Catalogo</h1>
        <form className="flex gap-2" action="/">
          <input
            name="search"
            defaultValue={search}
            placeholder="Buscar produtos..."
            className="rounded border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm outline-none focus:border-violet-500"
          />
          <button className="rounded bg-violet-600 px-3 py-1.5 text-sm text-white hover:bg-violet-500">
            Buscar
          </button>
        </form>
      </header>

      {result.data.length === 0 ? (
        <p className="text-neutral-400">Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {result.data.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        basePath="/"
        searchParams={search ? { search } : undefined}
      />
    </section>
  );
}
