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

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function CheckoutForm() {
  const { items, total, clear } = useCart();
  const router = useRouter();
  const [customerId, setCustomerId] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('PIX');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong bg-surface/50 p-12 text-center">
        <span
          aria-hidden
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-2xl"
        >
          🛒
        </span>
        <p className="mt-4 font-medium">Seu carrinho esta vazio</p>
        <p className="mt-1 text-sm text-muted">
          Adicione produtos ao catalogo para iniciar um pedido.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!UUID_REGEX.test(customerId.trim())) {
      setError('Informe um ID de cliente valido (formato UUID).');
      return;
    }

    if (items.length === 0) {
      setError('Seu carrinho esta vazio.');
      return;
    }

    setLoading(true);
    try {
      const orderRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customerId.trim(),
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          method,
        }),
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
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold">Dados do cliente</h2>
          <label className="block text-sm">
            <span className="text-muted">ID do cliente (UUID)</span>
            <input
              type="text"
              required
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="00000000-0000-0000-0000-000000000000"
              className="input mt-1.5"
              aria-describedby="customerId-hint"
            />
            <span id="customerId-hint" className="mt-1 block text-xs text-faint">
              Formato: 8-4-4-4-12 caracteres hexadecimais.
            </span>
          </label>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold">Metodo de pagamento</h2>
          <div
            role="radiogroup"
            aria-label="Selecione o metodo de pagamento"
            className="grid gap-3 sm:grid-cols-3"
          >
            {methods.map((m) => {
              const selected = method === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setMethod(m.value)}
                  onKeyDown={(e) => {
                    const idx = methods.findIndex((x) => x.value === m.value);
                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                      e.preventDefault();
                      const next = (idx + 1) % methods.length;
                      setMethod(methods[next].value);
                    } else if (
                      e.key === 'ArrowLeft' ||
                      e.key === 'ArrowUp'
                    ) {
                      e.preventDefault();
                      const prev =
                        (idx - 1 + methods.length) % methods.length;
                      setMethod(methods[prev].value);
                    }
                  }}
                  className={`rounded-xl border p-4 text-left transition focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
                    selected
                      ? 'border-accent bg-accent-soft'
                      : 'border-line hover:border-line-strong hover:bg-surface-2'
                  }`}
                >
                  <div aria-hidden className="text-2xl">
                    {m.icon}
                  </div>
                  <div className="mt-2 font-medium">{m.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-accent font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? 'Processando...' : `Finalizar pedido - ${formatBRL(total)}`}
        </button>
      </form>

      <aside
        aria-label="Resumo do pedido"
        className="h-fit rounded-2xl border border-line bg-surface p-6 shadow-card"
      >
        <h2 className="mb-4 text-lg font-semibold">Resumo</h2>
        <ul className="space-y-3 text-sm">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-2">
              <span className="text-muted">
                {item.quantity}x {item.name}
              </span>
              <span className="font-medium tabular-nums">
                {formatBRL(item.unitPrice * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-line pt-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-accent tabular-nums">
              {formatBRL(total)}
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
