'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatBRL } from '@/lib/api';
import type { Product } from '@/lib/types';
import { useCart } from './CartProvider';

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 transition hover:border-violet-700">
      <div className="flex aspect-video items-center justify-center bg-neutral-800 text-4xl">
        <span aria-hidden>🛍️</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link
          href={`/products/${product.id}`}
          className="line-clamp-2 font-medium hover:text-violet-400"
        >
          {product.name}
        </Link>
        <span className="text-xs text-neutral-400">SKU {product.sku}</span>
        <div className="mt-auto flex items-center justify-between">
          <span className="font-semibold">{formatBRL(product.price)}</span>
          <button
            type="button"
            disabled={product.stock === 0}
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
            className="rounded bg-violet-600 px-2 py-1 text-xs text-white hover:bg-violet-500 disabled:opacity-40"
          >
            {product.stock === 0
              ? 'Sem estoque'
              : added
                ? 'Adicionado'
                : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  );
}
