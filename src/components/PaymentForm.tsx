'use client';

import { useState } from 'react';
import { formatBRL, formatDateTime } from '@/lib/api';
import type { Payment, PaymentMethod } from '@/lib/types';

const methodLabel: Record<PaymentMethod, string> = {
  PIX: 'PIX',
  CREDIT_CARD: 'Cartao de Credito',
  BOLETO: 'Boleto',
};

const statusLabel: Record<string, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  FAILED: 'Falhou',
  REFUNDED: 'Estornado',
};

const statusColor: Record<string, string> = {
  PENDING: 'bg-warning/10 text-warning',
  PAID: 'bg-success/10 text-success',
  FAILED: 'bg-danger/10 text-danger',
  REFUNDED: 'bg-surface-2 text-muted',
};

const methods: PaymentMethod[] = ['PIX', 'CREDIT_CARD', 'BOLETO'];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function PaymentForm() {
  const [orderId, setOrderId] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('PIX');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Payment | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!UUID_REGEX.test(orderId.trim())) {
      setError('Informe um ID de pedido valido (formato UUID).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId.trim(), method }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Erro no pagamento');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold">Processar pagamento</h2>
          <div className="space-y-5">
            <label className="block text-sm">
              <span className="text-muted">ID do pedido</span>
              <input
                type="text"
                required
                inputMode="text"
                autoComplete="off"
                spellCheck={false}
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="UUID do pedido"
                className="input mt-1.5"
                aria-describedby="orderId-hint"
              />
              <span id="orderId-hint" className="mt-1 block text-xs text-faint">
                Formato: 8-4-4-4-12 caracteres hexadecimais.
              </span>
            </label>
            <fieldset>
              <legend className="text-sm text-muted">
                Metodo de pagamento
              </legend>
              <div
                role="radiogroup"
                aria-label="Selecione o metodo de pagamento"
                className="mt-2 grid gap-3 sm:grid-cols-3"
              >
                {methods.map((m) => {
                  const selected = method === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setMethod(m)}
                      onKeyDown={(e) => {
                        const idx = methods.indexOf(m);
                        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                          e.preventDefault();
                          const next = (idx + 1) % methods.length;
                          setMethod(methods[next]);
                        } else if (
                          e.key === 'ArrowLeft' ||
                          e.key === 'ArrowUp'
                        ) {
                          e.preventDefault();
                          const prev =
                            (idx - 1 + methods.length) % methods.length;
                          setMethod(methods[prev]);
                        }
                      }}
                      className={`flex min-h-[48px] items-center justify-center rounded-xl border px-3 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
                        selected
                          ? 'border-accent bg-accent-soft'
                          : 'border-line hover:border-line-strong hover:bg-surface-2'
                      }`}
                    >
                      {methodLabel[m]}
                    </button>
                  );
                })}
              </div>
            </fieldset>
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
          {loading ? 'Processando...' : 'Processar pagamento'}
        </button>
      </form>

      <div aria-live="polite">
        {result ? (
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold">Resultado</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted">Status</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusColor[result.status] ?? ''
                  }`}
                >
                  {statusLabel[result.status] ?? result.status}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted">Metodo</span>
                <span>{methodLabel[result.method]}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted">Valor</span>
                <span className="font-medium tabular-nums">
                  {formatBRL(result.amount)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted">Transacao</span>
                <span className="truncate font-mono text-xs tabular-nums">
                  {result.transactionId}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted">Criado em</span>
                <span>{formatDateTime(result.createdAt)}</span>
              </div>
              {result.paidAt && (
                <div className="flex justify-between gap-2">
                  <span className="text-muted">Pago em</span>
                  <span>{formatDateTime(result.paidAt)}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-surface/50 p-8 text-center text-muted">
            <span aria-hidden className="text-2xl">
              💳
            </span>
            <p className="mt-3 text-sm">
              O resultado do pagamento aparecera aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
