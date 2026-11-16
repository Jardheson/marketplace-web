'use client';

import Link from 'next/link';

interface Props {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string>;
}

export function Pagination({ page, totalPages, basePath, searchParams = {} }: Props) {
  const total = Math.max(1, totalPages);

  function href(p: number) {
    const qs = new URLSearchParams(searchParams);
    if (p > 1) qs.set('page', String(p));
    else qs.delete('page');
    const q = qs.toString();
    return q ? `${basePath}?${q}` : basePath;
  }

  return (
    <nav className="flex items-center justify-between text-sm">
      <Link
        href={href(Math.max(1, page - 1))}
        className="rounded border border-neutral-700 px-3 py-1.5 hover:bg-neutral-800"
      >
        Anterior
      </Link>
      <span className="text-neutral-400">
        Pagina {page} de {total}
      </span>
      <Link
        href={href(Math.min(total, page + 1))}
        className="rounded border border-neutral-700 px-3 py-1.5 hover:bg-neutral-800"
      >
        Proxima
      </Link>
    </nav>
  );
}
