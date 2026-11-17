import { NextResponse } from 'next/server';
import { createOrder, processPayment } from '@/lib/api';
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

    const { customerId, items, method } = body as {
      customerId?: string;
      items?: unknown;
      method?: string;
    };

    if (!customerId || typeof customerId !== 'string' || !UUID_REGEX.test(customerId)) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'ID do cliente invalido (UUID esperado)' } },
        { status: 400 },
      );
    }

    if (!method || !VALID_METHODS.includes(method as PaymentMethod)) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Metodo de pagamento invalido' } },
        { status: 400 },
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Lista de itens invalida' } },
        { status: 400 },
      );
    }

    if (items.length > 100) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Limite de 100 itens por pedido' } },
        { status: 400 },
      );
    }

    const sanitizedItems = items.map((item: unknown) => {
      if (!item || typeof item !== 'object') {
        throw new Error('Item invalido');
      }
      const { productId, quantity } = item as { productId?: string; quantity?: number };
      if (!productId || typeof productId !== 'string' || !UUID_REGEX.test(productId)) {
        throw new Error('ID de produto invalido');
      }
      const qty = Number(quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 999) {
        throw new Error('Quantidade invalida');
      }
      return { productId, quantity: qty };
    });

    const order = await createOrder({
      customerId,
      items: sanitizedItems,
    });

    const payment = await processPayment({
      orderId: order.id,
      method: method as PaymentMethod,
    });

    return NextResponse.json({ order, payment }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error && err.message.length < 200
        ? err.message
        : 'Erro no servidor';
    const status =
      err instanceof Error &&
      (message.includes('invalido') || message.includes('invalida') || message.includes('limite'))
        ? 400
        : 500;
    return NextResponse.json(
      { error: { code: 'CHECKOUT_ERROR', message } },
      { status },
    );
  }
}
