import { notFound } from 'next/navigation';
import { formatBRL, formatDateTime, getOrder } from '@/lib/api';

const statusLabel: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  PAID: 'Pago',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
};

const statusColor: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-400',
  CONFIRMED: 'bg-blue-500/10 text-blue-400',
  PAID: 'bg-green-500/10 text-green-400',
  SHIPPED: 'bg-purple-500/10 text-purple-400',
  DELIVERED: 'bg-emerald-500/10 text-emerald-400',
  CANCELLED: 'bg-red-500/10 text-red-400',
};

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { id } = await params;
  const { payment } = await searchParams;

  let order;
  try {
    order = await getOrder(id);
  } catch {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Pedido {order.id.slice(0, 8)}</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Criado em {formatDateTime(order.createdAt)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            statusColor[order.status] ?? ''
          }`}
        >
          {statusLabel[order.status] ?? order.status}
        </span>
      </div>

      {payment && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
          Pagamento processado! ID da transacao:{' '}
          <span className="font-mono">{payment.slice(0, 8)}...</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="mb-4 text-lg font-semibold">Itens do pedido</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between border-b border-neutral-800 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-neutral-400">
                      {item.quantity}x {formatBRL(item.unitPrice)}
                    </p>
                  </div>
                  <span className="font-medium">{formatBRL(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-fit rounded-lg border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="mb-4 text-lg font-semibold">Resumo</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-400">Subtotal</span>
              <span>{formatBRL(order.total)}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-800 pt-2 text-lg font-semibold">
              <span>Total</span>
              <span className="text-violet-400">{formatBRL(order.total)}</span>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-neutral-400">
            <p>
              Cliente:{' '}
              <span className="font-mono text-neutral-300">
                {order.customerId}
              </span>
            </p>
            <p>Moeda: {order.currency}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
