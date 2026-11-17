import { listOrders } from '@/lib/api';
import { formatBRL, formatDate } from '@/lib/api';
import { Pagination } from '@/components/Pagination';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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

function safePage(pageParam: string | undefined): number {
  const n = Number(pageParam);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) return 1;
  return n;
}

function safeString(value: string | undefined, maxLen = 100): string {
  if (!value) return '';
  return value.slice(0, maxLen);
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; customerId?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = safePage(params.page);
  const customerId = safeString(params.customerId, 64);
  const status = safeString(params.status, 20);
  const result = await listOrders({ page, pageSize: 10, customerId, status });

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
          <p className="mt-1 text-sm text-muted">
            Acompanhe e filtre os pedidos realizados.
          </p>
        </div>
        <form className="flex flex-wrap gap-2" action="/orders" role="search">
          <label htmlFor="customerId" className="sr-only">
            Filtrar por ID do cliente
          </label>
          <input
            id="customerId"
            name="customerId"
            defaultValue={customerId}
            placeholder="ID do cliente"
            className="input w-full sm:w-auto"
          />
          <label htmlFor="status-filter" className="sr-only">
            Filtrar por status
          </label>
          <select
            id="status-filter"
            name="status"
            defaultValue={status}
            className="input w-full sm:w-auto"
          >
            <option value="">Todos os status</option>
            <option value="PENDING">Pendente</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="PAID">Pago</option>
            <option value="SHIPPED">Enviado</option>
            <option value="DELIVERED">Entregue</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
          <button
            type="submit"
            className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-accent px-4 text-sm font-medium text-white transition hover:bg-accent-hover sm:w-auto"
          >
            Filtrar
          </button>
        </form>
      </header>

      {result.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-surface/50 px-6 py-16 text-center">
          <span
            aria-hidden
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-2xl"
          >
            📦
          </span>
          <p className="mt-4 font-medium">Nenhum pedido encontrado</p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            {customerId || status
              ? 'Tente ajustar os filtros aplicados.'
              : 'Os pedidos realizados aparecerao aqui.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line shadow-card">
          <div className="overflow-x-auto">
            <table
              className="w-full text-sm"
              aria-label="Lista de pedidos"
            >
              <thead className="bg-surface text-left text-xs uppercase tracking-wide text-faint">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    ID
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Cliente
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Total
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Data
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Acao
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-line transition hover:bg-surface-2/60"
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {order.customerId.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusColor[order.status] ?? ''
                        }`}
                      >
                        {statusLabel[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium tabular-nums">
                      {formatBRL(order.total)}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/orders/${order.id}`}
                        className="font-medium text-accent transition hover:text-accent-hover"
                      >
                        Detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result.totalPages > 1 && (
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          basePath="/orders"
          searchParams={{
            ...(customerId ? { customerId } : {}),
            ...(status ? { status } : {}),
          }}
        />
      )}
    </section>
  );
}
