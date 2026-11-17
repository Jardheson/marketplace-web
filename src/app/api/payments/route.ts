import { NextResponse } from 'next/server';
import { processPayment } from '@/lib/api';
import type { PaymentMethod } from '@/lib/types';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VALID_METHODS: PaymentMethod[] = ['PIX', 'CREDIT_CARD', 'BOLETO'];

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'JSON invalido' } },
        { status: 400 },
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Corpo da requisicao invalido' } },
        { status: 400 },
      );
    }

    const { orderId, method } = body as {
      orderId?: string;
      method?: string;
    };

    if (!orderId || typeof orderId !== 'string' || !UUID_REGEX.test(orderId)) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'ID do pedido invalido (UUID esperado)' } },
        { status: 400 },
      );
    }

    if (!method || !VALID_METHODS.includes(method as PaymentMethod)) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Metodo de pagamento invalido' } },
        { status: 400 },
      );
    }

    const payment = await processPayment({
      orderId,
      method: method as PaymentMethod,
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error && err.message.length < 200
        ? err.message
        : 'Erro no servidor';
    const status =
      err instanceof Error &&
      (message.includes('invalido') || message.includes('invalida'))
        ? 400
        : 500;
    return NextResponse.json(
      { error: { code: 'PAYMENT_ERROR', message } },
      { status },
    );
  }
}
