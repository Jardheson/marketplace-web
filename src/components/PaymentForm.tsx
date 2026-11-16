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
  PENDING: 'bg-yellow-500/10 text-yellow-400',
  PAID: 'bg-green-500/10 text-green-400',
  FAILED: 'bg-red-500/10 text-red-400',
  REFUNDED: 'bg-gray-500/10 text-gray-400',
};

export function PaymentForm() {
  const [orderId, setOrderId] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('PIX');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Payment | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, method }),
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
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="mb-4 text-lg font-semibold">Processar pagamento</h2>
          <div className="space-y-4">
            <label className="block text-sm">
              <span className="text-neutral-400">ID do pedido</span>
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="UUID do pedido"
                className="mt-1 w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-violet-500"
              />
            </label>
            <div>
              <span className="text-sm text-neutral-400">Metodo</span>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                {(['PIX', 'CREDIT_CARD', 'BOLETO'] as PaymentMethod[]).map(
                  (m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={`rounded-lg border p-3 text-sm font-medium transition ${
                        method === m
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-neutral-700 hover:border-neutral-600'
                      }`}
                    >
                      {methodLabel[m]}
                    </button>
                  ),
                )}
              </div>
            </div>
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
          {loading ? 'Processando...' : 'Processar pagamento'}
        </button>
      </form>

      <div>
        {result ? (
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="mb-4 text-lg font-semibold">Resultado</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Status</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    statusColor[result.status] ?? ''
                  }`}
                >
                  {statusLabel[result.status] ?? result.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Metodo</span>
                <span>{methodLabel[result.method]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Valor</span>
                <span className="font-medium">{formatBRL(result.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Transacao</span>
                <span className="font-mono text-xs">
                  {result.transactionId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Criado em</span>
                <span>{formatDateTime(result.createdAt)}</span>
              </div>
              {result.paidAt && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Pago em</span>
                  <span>{formatDateTime(result.paidAt)}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-neutral-800 p-6 text-center text-neutral-500">
            O resultado do pagamento aparecera aqui.
          </div>
        )}
      </div>
    </div>
  );
}
