// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Order } from '@/lib/types';

vi.mock('@/lib/api', () => ({
  createOrder: vi.fn(),
  processPayment: vi.fn(),
}));

import { POST } from './route';
import { createOrder, processPayment } from '@/lib/api';

const UUID = '11111111-1111-1111-1111-111111111111';
const PRODUCT_ID = '22222222-2222-2222-2222-222222222222';

const validBody = {
  customerId: UUID,
  method: 'PIX',
  items: [{ productId: PRODUCT_ID, quantity: 2 }],
};

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

async function readError(res: Response) {
  const json = await res.json();
  return json.error?.code as string;
}

beforeEach(() => {
  vi.mocked(createOrder).mockReset();
  vi.mocked(processPayment).mockReset();
});

describe('POST /api/checkout - validacao de entrada', () => {
  it('rejeita JSON malformado com 400', async () => {
    const res = await POST(makeRequest('{ nao e json'));
    expect(res.status).toBe(400);
    expect(await readError(res)).toBe('BAD_REQUEST');
  });

  it('rejeita corpo nulo com 400', async () => {
    const res = await POST(makeRequest(null));
    expect(res.status).toBe(400);
  });

  it('rejeita customerId ausente ou fora do formato UUID', async () => {
    for (const customerId of [undefined, '', 'abc', '123']) {
      const res = await POST(makeRequest({ ...validBody, customerId }));
      expect(res.status).toBe(400);
      expect(createOrder).not.toHaveBeenCalled();
    }
  });

  it('rejeita metodo de pagamento nao suportado', async () => {
    const res = await POST(makeRequest({ ...validBody, method: 'BITCOIN' }));
    expect(res.status).toBe(400);
    expect(createOrder).not.toHaveBeenCalled();
  });

  it('rejeita lista de itens vazia', async () => {
    const res = await POST(makeRequest({ ...validBody, items: [] }));
    expect(res.status).toBe(400);
    expect(createOrder).not.toHaveBeenCalled();
  });

  it('rejeita pedido acima do limite de 100 itens', async () => {
    const items = Array.from({ length: 101 }, () => ({
      productId: PRODUCT_ID,
      quantity: 1,
    }));
    const res = await POST(makeRequest({ ...validBody, items }));
    expect(res.status).toBe(400);
    expect(createOrder).not.toHaveBeenCalled();
  });

  it('rejeita productId fora do formato UUID', async () => {
    const res = await POST(
      makeRequest({
        ...validBody,
        items: [{ productId: 'nao-uuid', quantity: 1 }],
      }),
    );
    expect(res.status).toBe(400);
    expect(createOrder).not.toHaveBeenCalled();
  });

  it('rejeita quantidade invalida (zero, negativa ou fracionada)', async () => {
    for (const quantity of [0, -1, 1.5, 'muitos']) {
      const res = await POST(
        makeRequest({
          ...validBody,
          items: [{ productId: PRODUCT_ID, quantity }],
        }),
      );
      expect(res.status).toBe(400);
    }
    expect(createOrder).not.toHaveBeenCalled();
  });
});

describe('POST /api/checkout - caminho feliz', () => {
  it('cria o pedido e processa o pagamento com dados normalizados', async () => {
    vi.mocked(createOrder).mockResolvedValue({ id: UUID } as Order);
    vi.mocked(processPayment).mockResolvedValue({ id: 'pay-1' } as never);

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(201);
    expect(createOrder).toHaveBeenCalledWith({
      customerId: UUID,
      items: [{ productId: PRODUCT_ID, quantity: 2 }],
    });
    expect(processPayment).toHaveBeenCalledWith({
      orderId: UUID,
      method: 'PIX',
    });

    const json = await res.json();
    expect(json.order.id).toBe(UUID);
    expect(json.payment.id).toBe('pay-1');
  });

  it('retorna 500 e nao vaza stack trace quando a API falha', async () => {
    vi.mocked(createOrder).mockRejectedValue(
      new Error('x'.repeat(500)),
    );

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.message).toBe('Erro no servidor');
    expect(processPayment).not.toHaveBeenCalled();
  });
});
