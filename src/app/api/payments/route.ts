import { NextResponse } from 'next/server';
import { processPayment } from '@/lib/api';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, method } = body;

    if (!orderId || !method) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Dados incompletos' } },
        { status: 400 },
      );
    }

    const payment = await processPayment({ orderId, method });
    return NextResponse.json(payment, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro no servidor';
    return NextResponse.json(
      { error: { code: 'PAYMENT_ERROR', message } },
      { status: 500 },
    );
  }
}
