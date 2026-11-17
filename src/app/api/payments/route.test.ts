// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Payment } from '@/lib/types';

vi.mock('@/lib/api', () => ({
  processPayment: vi.fn(),
}));

import { POST } from './route';
import { processPayment } from '@/lib/api';

const UUID = '11111111-1111-1111-1111-111111111111';

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.mocked(processPayment).mockReset();
});

describe('POST /api/payments - validacao de entrada', () => {
  it('rejeita JSON malformado com 400', async () => {
    const res = await POST(makeRequest('{ quebrado'));
    expect(res.status).toBe(400);
  });

  it('rejeita orderId ausente ou fora do formato UUID', async () => {
    for (const orderId of [undefined, '', 'xyz']) {
      const res = await POST(makeRequest({ orderId, method: 'PIX' }));
      expect(res.status).toBe(400);
      expect(processPayment).not.toHaveBeenCalled();
    }
  });

  it('rejeita metodo de pagamento nao suportado', async () => {
    const res = await POST(
      makeRequest({ orderId: UUID, method: 'CARTAO_DE_LOJA' }),
    );
    expect(res.status).toBe(400);
    expect(processPayment).not.toHaveBeenCalled();
  });

  it('processa o pagamento com dados validos', async () => {
    vi.mocked(processPayment).mockResolvedValue({
      id: 'pay-9',
      status: 'PENDING',
    } as Payment);

    const res = await POST(makeRequest({ orderId: UUID, method: 'BOLETO' }));

    expect(res.status).toBe(201);
    expect(processPayment).toHaveBeenCalledWith({
      orderId: UUID,
      method: 'BOLETO',
    });
    const json = await res.json();
    expect(json.id).toBe('pay-9');
  });
});
