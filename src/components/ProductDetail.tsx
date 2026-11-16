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
    <div className="grid gap-8 md:grid-cols-2">
      <div className="flex aspect-square items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-8xl">
        <span aria-hidden>🛍️</span>
      </div>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="mt-1 text-sm text-neutral-400">SKU {product.sku}</p>
        </div>
        <p className="text-3xl font-bold text-violet-400">
          {formatBRL(product.price)}
        </p>
        {product.description && (
          <p className="text-neutral-300">{product.description}</p>
        )}
        <p className="text-sm text-neutral-400">
          Estoque disponivel:{' '}
          <span className="font-medium text-neutral-200">{product.stock}</span>
        </p>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded border border-neutral-700">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-3 py-1.5 text-lg hover:bg-neutral-800"
            >
              -
            </button>
            <span className="w-10 text-center">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
              className="px-3 py-1.5 text-lg hover:bg-neutral-800"
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
            className="flex-1 rounded bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-500 disabled:opacity-40"
          >
            {product.stock === 0
              ? 'Sem estoque'
              : added
                ? 'Adicionado ao carrinho'
                : 'Adicionar ao carrinho'}
          </button>
        </div>
      </div>
    </div>
  );
}
