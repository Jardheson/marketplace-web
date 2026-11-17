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
  const prevDisabled = page <= 1;
  const nextDisabled = page >= total;

  function href(p: number) {
    const qs = new URLSearchParams(searchParams);
    if (p > 1) qs.set('page', String(p));
    else qs.delete('page');
    const q = qs.toString();
    return q ? `${basePath}?${q}` : basePath;
  }

  const baseBtn =
    'flex min-h-[44px] items-center justify-center rounded-xl border border-line px-4 text-sm font-medium transition';
  const enabledBtn = 'hover:border-line-strong hover:bg-surface-2';
  const disabledBtn = 'pointer-events-none opacity-40 cursor-not-allowed';

  return (
    <nav
      aria-label="Paginacao"
      className="flex flex-wrap items-center justify-between gap-3 pt-2"
    >
      {prevDisabled ? (
        <span
          aria-disabled="true"
          className={`${baseBtn} ${disabledBtn}`}
        >
          &larr; Anterior
        </span>
      ) : (
        <Link
          href={href(Math.max(1, page - 1))}
          rel="prev"
          className={`${baseBtn} ${enabledBtn}`}
        >
          &larr; Anterior
        </Link>
      )}
      <span className="text-sm text-muted">
        Pagina{' '}
        <span className="font-medium text-ink tabular-nums">{page}</span> de{' '}
        <span className="tabular-nums">{total}</span>
      </span>
      {nextDisabled ? (
        <span
          aria-disabled="true"
          className={`${baseBtn} ${disabledBtn}`}
        >
          Proxima &rarr;
        </span>
      ) : (
        <Link
          href={href(Math.min(total, page + 1))}
          rel="next"
          className={`${baseBtn} ${enabledBtn}`}
        >
          Proxima &rarr;
        </Link>
      )}
    </nav>
  );
}
