// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Product } from '@/lib/types';

vi.mock('@/lib/api', () => ({
  createProduct: vi.fn(),
}));

import { POST } from './route';
import { createProduct } from '@/lib/api';

const CATEGORY_ID = '11111111-1111-1111-1111-111111111111';

const validBody = {
  name: 'Fone Bluetooth',
  price: 19990,
  stock: 50,
  categoryId: CATEGORY_ID,
  sku: 'SKU-001',
};

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/catalog/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.mocked(createProduct).mockReset();
});

describe('POST /api/catalog/products - validacao de entrada', () => {
  it('rejeita JSON malformado com 400', async () => {
    const res = await POST(makeRequest('{ quebrado'));
    expect(res.status).toBe(400);
    expect(createProduct).not.toHaveBeenCalled();
  });

  it('rejeita nome curto demais', async () => {
    const res = await POST(makeRequest({ ...validBody, name: 'A' }));
    expect(res.status).toBe(400);
    expect(createProduct).not.toHaveBeenCalled();
  });

  it('rejeita categoria fora do formato UUID', async () => {
    const res = await POST(makeRequest({ ...validBody, categoryId: 'abc' }));
    expect(res.status).toBe(400);
    expect(createProduct).not.toHaveBeenCalled();
  });

  it('rejeita SKU ausente', async () => {
    const res = await POST(makeRequest({ ...validBody, sku: '  ' }));
    expect(res.status).toBe(400);
    expect(createProduct).not.toHaveBeenCalled();
  });

  it('rejeita preco nao inteiro ou menor que 1 centavo', async () => {
    for (const price of [0, -10, 10.5]) {
      const res = await POST(makeRequest({ ...validBody, price }));
      expect(res.status).toBe(400);
      expect(createProduct).not.toHaveBeenCalled();
    }
  });

  it('rejeita estoque negativo', async () => {
    const res = await POST(makeRequest({ ...validBody, stock: -1 }));
    expect(res.status).toBe(400);
    expect(createProduct).not.toHaveBeenCalled();
  });

  it('cria o produto com dados validos', async () => {
    vi.mocked(createProduct).mockResolvedValue({
      id: 'prod-1',
      name: 'Fone Bluetooth',
    } as Product);

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(201);
    expect(createProduct).toHaveBeenCalledWith({
      name: 'Fone Bluetooth',
      description: undefined,
      price: 19990,
      stock: 50,
      categoryId: CATEGORY_ID,
      sku: 'SKU-001',
    });
    const json = await res.json();
    expect(json.id).toBe('prod-1');
  });
});
