import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { CartProvider, useCart } from './CartProvider';

const STORAGE_KEY = 'marketplace.cart';

const cafe = {
  productId: '11111111-1111-1111-1111-111111111111',
  name: 'Cafe Especial',
  unitPrice: 2500,
  stock: 3,
};

const cha = {
  productId: '22222222-2222-2222-2222-222222222222',
  name: 'Cha Verde',
  unitPrice: 1000,
  stock: 10,
};

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

function setup() {
  return renderHook(() => useCart(), { wrapper });
}

beforeEach(() => {
  localStorage.clear();
});

describe('CartProvider', () => {
  it('inicia com o carrinho vazio', () => {
    const { result } = setup();
    expect(result.current.items).toEqual([]);
    expect(result.current.count).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it('adiciona um produto e calcula total e contagem', () => {
    const { result } = setup();

    act(() => result.current.add(cafe));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.count).toBe(1);
    expect(result.current.total).toBe(2500);
  });

  it('soma a quantidade quando o mesmo produto e adicionado novamente', () => {
    const { result } = setup();

    act(() => result.current.add(cafe));
    act(() => result.current.add(cafe));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.count).toBe(2);
    expect(result.current.total).toBe(5000);
  });

  it('nunca ultrapassa o estoque disponivel ao adicionar', () => {
    const { result } = setup();

    act(() => result.current.add(cafe, 5));

    expect(result.current.count).toBe(cafe.stock);
    expect(result.current.total).toBe(cafe.unitPrice * cafe.stock);
  });

  it('respeita o limite de estoque ao somar em produto ja existente', () => {
    const { result } = setup();

    act(() => result.current.add(cafe, 2));
    act(() => result.current.add(cafe, 2));

    expect(result.current.count).toBe(cafe.stock);
  });

  it('setQuantity limita o valor entre 1 e o estoque', () => {
    const { result } = setup();
    act(() => result.current.add(cafe, 1));

    act(() => result.current.setQuantity(cafe.productId, 999));
    expect(result.current.count).toBe(cafe.stock);

    act(() => result.current.setQuantity(cafe.productId, 0));
    expect(result.current.count).toBe(1);
  });

  it('remove um produto especifico', () => {
    const { result } = setup();
    act(() => {
      result.current.add(cafe);
      result.current.add(cha);
    });

    act(() => result.current.remove(cafe.productId));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].productId).toBe(cha.productId);
  });

  it('clear esvazia o carrinho', () => {
    const { result } = setup();
    act(() => {
      result.current.add(cafe);
      result.current.add(cha);
    });

    act(() => result.current.clear());

    expect(result.current.items).toEqual([]);
    expect(result.current.count).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it('persiste o carrinho no localStorage', () => {
    const { result } = setup();

    act(() => result.current.add(cafe, 2));

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].quantity).toBe(2);
  });

  it('restaura o carrinho a partir do localStorage', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ ...cafe, quantity: 2 }]),
    );

    const { result } = setup();

    expect(result.current.items).toHaveLength(1);
    expect(result.current.count).toBe(2);
    expect(result.current.total).toBe(5000);
  });
});
