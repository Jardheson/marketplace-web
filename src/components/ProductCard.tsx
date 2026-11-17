'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatBRL } from '@/lib/api';
import type { Product } from '@/lib/types';
import { useCart } from './CartProvider';

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase();
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock === 0;

  return (
    <article
      aria-labelledby={`product-${product.id}-name`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-pop"
    >
      <Link
        href={`/products/${product.id}`}
        aria-label={`Ver detalhes de ${product.name}`}
        className="relative block"
      >
        <div className="flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-surface-2 to-surface">
          <span
            aria-hidden
            className="text-3xl font-semibold tracking-tight text-accent/70 transition duration-300 group-hover:scale-105 sm:text-4xl"
          >
            {initials(product.name)}
          </span>
          {outOfStock && (
            <span className="absolute left-3 top-3 rounded-full bg-canvas/80 px-2.5 py-1 text-xs font-medium text-muted backdrop-blur">
              Sem estoque
            </span>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1">
          <h3
            id={`product-${product.id}-name`}
            className="text-sm font-medium leading-snug"
          >
            <Link
              href={`/products/${product.id}`}
              className="line-clamp-2 transition hover:text-accent"
            >
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 font-mono text-xs text-faint">SKU {product.sku}</p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-base font-semibold">
            {formatBRL(product.price)}
          </span>
          <button
            type="button"
            disabled={outOfStock}
            aria-label={
              outOfStock
                ? 'Produto indisponivel'
                : added
                  ? 'Produto adicionado ao carrinho'
                  : `Adicionar ${product.name} ao carrinho`
            }
            onClick={() => {
              add({
                productId: product.id,
                name: product.name,
                unitPrice: product.price,
                stock: product.stock,
              });
              setAdded(true);
              setTimeout(() => setAdded(false), 1500);
            }}
            className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-accent px-3 text-sm font-medium text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-faint"
          >
            {outOfStock ? 'Indisponivel' : added ? 'Adicionado ✓' : 'Adicionar'}
          </button>
        </div>
      </div>
      {added && (
        <span
          role="status"
          aria-live="polite"
          className="sr-only"
        >
          {product.name} adicionado ao carrinho
        </span>
      )}
    </article>
  );
}
