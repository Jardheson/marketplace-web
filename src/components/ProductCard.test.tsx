import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider } from './CartProvider';
import { ProductCard } from './ProductCard';
import type { Product } from '@/lib/types';

const baseProduct: Product = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Cafe Especial',
  description: 'Graos selecionados',
  price: 2500,
  currency: 'BRL',
  stock: 5,
  categoryId: 'cat-1',
  sku: 'CAFE-001',
  active: true,
  createdAt: '2026-03-04T12:00:00.000Z',
  updatedAt: '2026-03-04T12:00:00.000Z',
};

function renderCard(product: Product) {
  return render(
    <CartProvider>
      <ProductCard product={product} />
    </CartProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('ProductCard', () => {
  it('exibe nome, SKU e preco formatado em Real', () => {
    renderCard(baseProduct);

    expect(
      screen.getByRole('heading', { name: 'Cafe Especial' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/SKU CAFE-001/)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s?25,00/)).toBeInTheDocument();
  });

  it('expoe um link acessivel para os detalhes do produto', () => {
    renderCard(baseProduct);

    const link = screen.getByRole('link', {
      name: 'Ver detalhes de Cafe Especial',
    });
    expect(link).toHaveAttribute('href', `/products/${baseProduct.id}`);
  });

  it('adiciona ao carrinho e anuncia o resultado para leitores de tela', async () => {
    const user = userEvent.setup();
    renderCard(baseProduct);

    const button = screen.getByRole('button', {
      name: 'Adicionar Cafe Especial ao carrinho',
    });
    await user.click(button);

    expect(
      screen.getByRole('button', { name: 'Produto adicionado ao carrinho' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Cafe Especial adicionado ao carrinho',
    );
  });

  it('bloqueia a compra quando nao ha estoque', () => {
    renderCard({ ...baseProduct, stock: 0 });

    const button = screen.getByRole('button', {
      name: 'Produto indisponivel',
    });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Indisponivel');
  });
});
