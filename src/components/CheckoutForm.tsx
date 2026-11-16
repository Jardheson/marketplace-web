'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formatBRL } from '@/lib/api';
import { useCart } from './CartProvider';
import type { PaymentMethod } from '@/lib/types';

const methods: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'PIX', label: 'PIX', icon: '⚡' },
  { value: 'CREDIT_CARD', label: 'Cartao de Credito', icon: '💳' },
  { value: 'BOLETO', label: 'Boleto', icon: '📄' },
];

export function CheckoutForm() {
  const { items, total, clear } = useCart();
  const router = useRouter();
  const [customerId, setCustomerId] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('PIX');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-8 text-center">
        <p className="text-neutral-400">Seu carrinho esta vazio.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const orderRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, items, method }),
      });
      const data = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(data.error?.message || 'Erro ao finalizar pedido');
      }
      clear();
      router.push(`/orders/${data.order.id}?payment=${data.payment?.id ?? ''}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="mb-4 text-lg font-semibold">Dados do cliente</h2>
          <label className="block text-sm">
            <span className="text-neutral-400">ID do cliente (UUID)</span>
            <input
              type="text"
              required
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="00000000-0000-0000-0000-000000000000"
              className="mt-1 w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-violet-500"
            />
          </label>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="mb-4 text-lg font-semibold">Metodo de pagamento</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {methods.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMethod(m.value)}
                className={`rounded-lg border p-4 text-left transition ${
                  method === m.value
                    ? 'border-violet-500 bg-violet-500/10'
                    : 'border-neutral-700 hover:border-neutral-600'
                }`}
              >
                <div className="text-2xl">{m.icon}</div>
                <div className="mt-2 font-medium">{m.label}</div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-violet-600 py-3 font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
        >
          {loading ? 'Processando...' : `Finalizar pedido - ${formatBRL(total)}`}
        </button>
      </form>

      <aside className="h-fit rounded-lg border border-neutral-800 bg-neutral-900 p-6">
        <h2 className="mb-4 text-lg font-semibold">Resumo</h2>
        <ul className="space-y-3 text-sm">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-2">
              <span className="text-neutral-300">
                {item.quantity}x {item.name}
              </span>
              <span className="font-medium">
                {formatBRL(item.unitPrice * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-neutral-800 pt-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-violet-400">{formatBRL(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
