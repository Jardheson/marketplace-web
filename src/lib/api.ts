import type {
  Category,
  Order,
  Paginated,
  Payment,
  PaymentMethod,
  Product,
} from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const API = `${BASE_URL}/api/v1`;

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    cache: 'no-store',
  });
  if (!res.ok) {
    let code = 'ERROR';
    let message = `Falha na requisicao (${res.status})`;
    try {
      const body = await res.json();
      code = body?.error?.code ?? code;
      message = body?.error?.message ?? message;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, code, message);
  }
  return res.json() as Promise<T>;
}

function toQuery(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  const query = qs.toString();
  return query ? `?${query}` : '';
}

export function listProducts(params: {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  search?: string;
  active?: boolean;
} = {}) {
  return request<Paginated<Product>>(`/products${toQuery(params)}`);
}

export function getProduct(id: string) {
  return request<Product>(`/products/${id}`);
}

export function listOrders(params: {
  page?: number;
  pageSize?: number;
  customerId?: string;
  status?: string;
} = {}) {
  return request<Paginated<Order>>(`/orders${toQuery(params)}`);
}

export function getOrder(id: string) {
  return request<Order>(`/orders/${id}`);
}

export function createOrder(input: {
  customerId: string;
  items: { productId: string; quantity: number }[];
}) {
  return request<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function processPayment(input: { orderId: string; method: PaymentMethod }) {
  return request<Payment>('/payments', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function createCategory(input: { name: string; description?: string }) {
  return request<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function createProduct(input: {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  sku: string;
  imageUrl?: string;
}) {
  return request<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function formatBRL(cents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR');
}
