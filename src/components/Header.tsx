'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCart } from './CartProvider';

const links = [
  { href: '/', label: 'Catalogo' },
  { href: '/orders', label: 'Pedidos' },
  { href: '/payments', label: 'Pagamentos' },
  { href: '/metrics', label: 'Metricas' },
  { href: '/admin', label: 'Admin' },
];

export function Header() {
  const { count } = useCart();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="glass sticky top-0 z-40 border-b border-line/80">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Pagina inicial da MERX"
          className="flex shrink-0 items-center gap-2.5"
        >
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white"
          >
            M
          </span>
          <span className="hidden text-base font-semibold tracking-tight sm:block">
            MERX<span className="text-accent">.</span>
          </span>
        </Link>

        <nav
          aria-label="Navegacao principal"
          className="hidden flex-1 items-center gap-1 md:flex"
        >
          {links.map((l) => {
            const active =
              l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? 'page' : undefined}
                className="flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium transition"
                style={{
                  background: active ? 'var(--color-accent-soft)' : 'transparent',
                  color: active ? 'var(--color-ink)' : 'var(--color-muted)',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'var(--color-surface-2)';
                    e.currentTarget.style.color = 'var(--color-ink)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--color-muted)';
                  }
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/checkout"
            aria-label={`Carrinho de compras com ${count} ${count === 1 ? 'item' : 'itens'}`}
            className="flex min-h-[44px] items-center gap-2 rounded-lg bg-accent px-3 text-sm font-medium text-white transition hover:bg-accent-hover"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            <span className="hidden sm:inline">Carrinho</span>
            <span
              aria-hidden
              className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold tabular-nums"
            >
              {count}
            </span>
          </Link>

          <button
            type="button"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-line text-ink transition hover:bg-surface-2 md:hidden"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Navegacao mobile"
          className="border-t border-line/80 bg-canvas/95 backdrop-blur md:hidden"
        >
          <ul className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6 lg:px-8">
            {links.map((l) => {
              const active =
                l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? 'page' : undefined}
                    className="flex min-h-[48px] items-center rounded-lg px-3 text-sm font-medium transition"
                    style={{
                      background: active ? 'var(--color-accent-soft)' : 'transparent',
                      color: active ? 'var(--color-ink)' : 'var(--color-muted)',
                    }}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
