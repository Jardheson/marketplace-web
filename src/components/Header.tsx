'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';

const links = [
  { href: '/', label: 'Catalogo' },
  { href: '/orders', label: 'Pedidos' },
  { href: '/payments', label: 'Pagamentos' },
  { href: '/metrics', label: 'Metricas' },
];

export function Header() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-white">
          Marketplace Modular
        </Link>
        <nav className="flex flex-1 gap-4 text-sm text-neutral-300">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/checkout"
          className="rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500"
        >
          Carrinho ({count})
        </Link>
      </div>
    </header>
  );
}
