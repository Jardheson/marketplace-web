'use client';

import { useState } from 'react';
import { formatBRL } from '@/lib/api';
import type { Product } from '@/lib/types';
import { useCart } from './CartProvider';

export function ProductDetail({ product }: { product: Product }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-surface-2 to-surface">
        <span
          aria-hidden
          className="text-5xl font-semibold tracking-tight text-accent/70 sm:text-6xl lg:text-7xl"
        >
          {product.name.trim().slice(0, 2).toUpperCase()}
        </span>
      </div>
      <div className="flex flex-col gap-5">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface-2 px-3 py-1 text-xs font-medium text-muted">
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${
                product.stock === 0 ? 'bg-danger' : 'bg-success'
              }`}
            />
            {product.stock === 0
              ? 'Sem estoque'
              : `${product.stock} em estoque`}
          </span>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {product.name}
          </h1>
          <p className="font-mono text-sm text-faint">SKU {product.sku}</p>
        </div>

        <p className="text-2xl font-semibold text-accent sm:text-3xl">
          {formatBRL(product.price)}
        </p>

        {product.description && (
          <p className="text-muted leading-relaxed">{product.description}</p>
        )}

        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div
            role="group"
            aria-label="Quantidade do produto"
            className="flex items-center rounded-xl border border-line bg-surface"
          >
            <button
              type="button"
              aria-label="Diminuir quantidade"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-11 w-11 items-center justify-center text-lg transition hover:text-accent"
            >
              -
            </button>
            <span
              className="min-w-[3rem] text-center font-medium tabular-nums"
              aria-live="polite"
            >
              {qty}
            </span>
            <button
              type="button"
              aria-label="Aumentar quantidade"
              onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
              className="flex h-11 w-11 items-center justify-center text-lg transition hover:text-accent"
            >
              +
            </button>
          </div>
          <button
            type="button"
            disabled={product.stock === 0}
            onClick={() => {
              add(
                {
                  productId: product.id,
                  name: product.name,
                  unitPrice: product.price,
                  stock: product.stock,
                },
                qty,
              );
              setAdded(true);
              setTimeout(() => setAdded(false), 1500);
            }}
            className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-accent px-5 font-medium text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-faint"
          >
            {product.stock === 0
              ? 'Sem estoque'
              : added
                ? 'Adicionado ao carrinho ✓'
                : 'Adicionar ao carrinho'}
          </button>
        </div>
        {added && (
          <span role="status" aria-live="polite" className="sr-only">
            {qty} {qty === 1 ? 'unidade' : 'unidades'} de {product.name}{' '}
            adicionada ao carrinho
          </span>
        )}
      </div>
    </div>
  );
}
