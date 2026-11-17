import { describe, it, expect, vi } from 'vitest';
import {
  ApiError,
  formatBRL,
  formatDate,
  formatDateTime,
  getProduct,
  listProducts,
} from './api';

// O Intl usa espaco nao separavel (U+00A0) em pt-BR; normalizamos para
// comparar de forma legivel e estavel entre ambientes.
const normalize = (value: string) => value.replace(/\u00A0/g, ' ');

describe('formatBRL', () => {
  it('converte centavos em Real brasileiro', () => {
    expect(normalize(formatBRL(1999))).toBe('R$ 19,99');
  });

  it('formata zero corretamente', () => {
    expect(normalize(formatBRL(0))).toBe('R$ 0,00');
  });

  it('aplica separador de milhar', () => {
    expect(normalize(formatBRL(123456))).toBe('R$ 1.234,56');
  });
});

describe('formatDate', () => {
  it('converte ISO para o formato DD/MM/AAAA', () => {
    // 12:00Z evita virada de dia em qualquer fuso relevante.
    expect(formatDate('2026-03-04T12:00:00.000Z')).toBe('04/03/2026');
  });
});

describe('formatDateTime', () => {
  it('inclui data e hora no padrao pt-BR', () => {
    expect(formatDateTime('2026-03-04T12:00:00.000Z')).toMatch(
      /^04\/03\/2026, \d{2}:\d{2}:\d{2}$/,
    );
  });
});

describe('ApiError', () => {
  it('preserva status, code e message', () => {
    const error = new ApiError(404, 'NOT_FOUND', 'Produto nao encontrado');
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Produto nao encontrado');
  });
});

describe('listProducts', () => {
  it('monta a URL com os parametros de paginacao e busca', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [],
        page: 2,
        pageSize: 12,
        total: 0,
        totalPages: 0,
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await listProducts({ page: 2, pageSize: 12, search: 'cafe' });

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain('/api/v1/products');
    expect(url).toContain('page=2');
    expect(url).toContain('pageSize=12');
    expect(url).toContain('search=cafe');
  });

  it('omite parametros vazios da query', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], page: 1, pageSize: 12, total: 0, totalPages: 0 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await listProducts({ search: '' });

    expect(String(fetchMock.mock.calls[0][0])).not.toContain('search=');
  });
});

describe('request (tratamento de erro)', () => {
  it('lanca ApiError com o codigo e a mensagem retornados pela API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: { code: 'BAD_REQUEST', message: 'ID invalido' },
        }),
      }),
    );

    await expect(getProduct('abc')).rejects.toMatchObject({
      status: 400,
      code: 'BAD_REQUEST',
      message: 'ID invalido',
    });
  });
});
