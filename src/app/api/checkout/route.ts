import { NextResponse } from 'next/server';
import { createOrder, processPayment } from '@/lib/api';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerId, items, method } = body;

    if (!customerId || !items?.length || !method) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Dados incompletos' } },
        { status: 400 },
      );
    }

    const order = await createOrder({
      customerId,
      items: items.map((i: { productId: string; quantity: number }) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    });

    const payment = await processPayment({ orderId: order.id, method });

    return NextResponse.json({ order, payment }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro no servidor';
    return NextResponse.json(
      { error: { code: 'CHECKOUT_ERROR', message } },
      { status: 500 },
    );
  }
}
