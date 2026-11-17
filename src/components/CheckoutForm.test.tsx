import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider } from './CartProvider';
import { CheckoutForm } from './CheckoutForm';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const STORAGE_KEY = 'marketplace.cart';
const UUID = '11111111-1111-1111-1111-111111111111';
const PRODUCT_ID = '22222222-2222-2222-2222-222222222222';

function seedCart() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([
      {
        productId: PRODUCT_ID,
        name: 'Cafe Especial',
        unitPrice: 2500,
        quantity: 2,
        stock: 5,
      },
    ]),
  );
}

function renderForm() {
  return render(
    <CartProvider>
      <CheckoutForm />
    </CartProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  push.mockReset();
});

describe('CheckoutForm', () => {
  it('mostra o estado vazio quando nao ha itens no carrinho', () => {
    renderForm();
    expect(screen.getByText('Seu carrinho esta vazio')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('valida o ID do cliente antes de chamar a API', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    seedCart();
    renderForm();

    const input = await screen.findByRole('textbox');
    await user.clear(input);
    await user.type(input, 'id-invalido');
    await user.click(screen.getByRole('button', { name: /finalizar pedido/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/ID de cliente valido/i);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it('envia o pedido e redireciona para o pedido criado', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ order: { id: UUID }, payment: { id: 'pay-1' } }),
    });
    vi.stubGlobal('fetch', fetchMock);
    seedCart();
    renderForm();

    const input = await screen.findByRole('textbox');
    await user.clear(input);
    await user.type(input, UUID);
    await user.click(screen.getByRole('button', { name: /finalizar pedido/i }));

    await waitFor(() => expect(push).toHaveBeenCalled());

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/checkout',
      expect.objectContaining({ method: 'POST' }),
    );
    const sentBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sentBody).toEqual({
      customerId: UUID,
      method: 'PIX',
      items: [{ productId: PRODUCT_ID, quantity: 2 }],
    });
    expect(push).toHaveBeenCalledWith(`/orders/${UUID}?payment=pay-1`);
  });

  it('remove um item do carrinho ao clicar em excluir', async () => {
    const user = userEvent.setup();
    seedCart();
    renderForm();

    await user.click(
      await screen.findByRole('button', { name: /remover cafe especial/i }),
    );

    expect(await screen.findByText('Seu carrinho esta vazio')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([]);
  });

  it('exibe a mensagem de erro retornada pela API', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: { code: 'BAD_REQUEST', message: 'Estoque insuficiente' },
        }),
      }),
    );
    seedCart();
    renderForm();

    const input = await screen.findByRole('textbox');
    await user.clear(input);
    await user.type(input, UUID);
    await user.click(screen.getByRole('button', { name: /finalizar pedido/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Estoque insuficiente',
    );
    expect(push).not.toHaveBeenCalled();
  });
});
