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
  PENDING: 'bg-yellow-500/10 text-yellow-400',
  CONFIRMED: 'bg-blue-500/10 text-blue-400',
  PAID: 'bg-green-500/10 text-green-400',
  SHIPPED: 'bg-purple-500/10 text-purple-400',
  DELIVERED: 'bg-emerald-500/10 text-emerald-400',
  CANCELLED: 'bg-red-500/10 text-red-400',
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; customerId?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? '1');
  const customerId = params.customerId ?? '';
  const status = params.status ?? '';
  const result = await listOrders({ page, pageSize: 10, customerId, status });

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Pedidos</h1>
        <form className="flex flex-wrap gap-2" action="/orders">
          <input
            name="customerId"
            defaultValue={customerId}
            placeholder="ID do cliente"
            className="rounded border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm outline-none focus:border-violet-500"
          />
          <select
            name="status"
            defaultValue={status}
            className="rounded border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm outline-none focus:border-violet-500"
          >
            <option value="">Todos os status</option>
            <option value="PENDING">Pendente</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="PAID">Pago</option>
            <option value="SHIPPED">Enviado</option>
            <option value="DELIVERED">Entregue</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
          <button className="rounded bg-violet-600 px-3 py-1.5 text-sm text-white hover:bg-violet-500">
            Filtrar
          </button>
        </form>
      </header>

      {result.data.length === 0 ? (
        <p className="text-neutral-400">Nenhum pedido encontrado.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-800">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900 text-left text-neutral-400">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((order) => (
                <tr
                  key={order.id}
                  className="border-t border-neutral-800 hover:bg-neutral-900/50"
                >
                  <td className="px-4 py-3 font-mono text-xs">
                    {order.id.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-400">
                    {order.customerId.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        statusColor[order.status] ?? ''
                      }`}
                    >
                      {statusLabel[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatBRL(order.total)}
                  </td>
                  <td className="px-4 py-3 text-neutral-400">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-violet-400 hover:text-violet-300"
                    >
                      Detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        basePath="/orders"
        searchParams={{
          ...(customerId ? { customerId } : {}),
          ...(status ? { status } : {}),
        }}
      />
    </section>
  );
}
