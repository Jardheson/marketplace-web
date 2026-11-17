// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Category } from '@/lib/types';

vi.mock('@/lib/api', () => ({
  createCategory: vi.fn(),
}));

import { POST } from './route';
import { createCategory } from '@/lib/api';

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/catalog/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.mocked(createCategory).mockReset();
});

describe('POST /api/catalog/categories - validacao de entrada', () => {
  it('rejeita JSON malformado com 400', async () => {
    const res = await POST(makeRequest('{ quebrado'));
    expect(res.status).toBe(400);
    expect(createCategory).not.toHaveBeenCalled();
  });

  it('rejeita nome ausente ou curto demais', async () => {
    for (const name of [undefined, '', 'A']) {
      const res = await POST(makeRequest({ name }));
      expect(res.status).toBe(400);
      expect(createCategory).not.toHaveBeenCalled();
    }
  });

  it('cria a categoria com dados validos', async () => {
    vi.mocked(createCategory).mockResolvedValue({
      id: 'cat-1',
      name: 'Eletronicos',
    } as Category);

    const res = await POST(makeRequest({ name: ' Eletronicos ' }));

    expect(res.status).toBe(201);
    expect(createCategory).toHaveBeenCalledWith({
      name: 'Eletronicos',
      description: undefined,
    });
    const json = await res.json();
    expect(json.id).toBe('cat-1');
  });
});
