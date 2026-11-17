import { notFound } from 'next/navigation';
import Link from 'next/link';
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
  PENDING: 'bg-warning/10 text-warning',
  CONFIRMED: 'bg-accent/10 text-accent',
  PAID: 'bg-success/10 text-success',
  SHIPPED: 'bg-accent/10 text-accent',
  DELIVERED: 'bg-success/10 text-success',
  CANCELLED: 'bg-danger/10 text-danger',
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
    <section className="space-y-8">
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-ink"
      >
        &larr; Voltar para pedidos
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Pedido {order.id.slice(0, 8)}
          </h1>
          <p className="mt-1 text-sm text-muted">
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
        <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success">
          <span aria-hidden>✓</span>
          <span>
            Pagamento processado! ID da transacao:{' '}
            <span className="font-mono">{payment.slice(0, 8)}...</span>
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold">Itens do pedido</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between border-b border-line pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted">
                      {item.quantity}x {formatBRL(item.unitPrice)}
                    </p>
                  </div>
                  <span className="font-medium">{formatBRL(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-fit rounded-2xl border border-line bg-surface p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold">Resumo</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatBRL(order.total)}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold">
              <span>Total</span>
              <span className="text-accent">{formatBRL(order.total)}</span>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-muted">
            <p className="break-all">
              Cliente:{' '}
              <span className="font-mono text-ink">{order.customerId}</span>
            </p>
            <p>Moeda: {order.currency}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
