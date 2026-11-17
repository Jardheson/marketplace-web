import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('exibe a posicao atual e o total de paginas', () => {
    render(
      <Pagination page={2} totalPages={5} basePath="/" />,
    );

    expect(screen.getByText(/Pagina/)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('desabilita "Anterior" na primeira pagina e "Proxima" na ultima', () => {
    const { rerender } = render(
      <Pagination page={1} totalPages={3} basePath="/" />,
    );

    // Na pagina 1 nao ha link de "Anterior", apenas o estado desabilitado.
    expect(
      screen.queryByRole('link', { name: /anterior/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Anterior/)).toHaveAttribute(
      'aria-disabled',
      'true',
    );

    // Na pagina 3 (ultima) o "Proxima" fica desabilitado.
    rerender(<Pagination page={3} totalPages={3} basePath="/" />);
    expect(
      screen.queryByRole('link', { name: /proxima/i }),
    ).not.toBeInTheDocument();
  });

  it('gera links preservando os filtros da busca', () => {
    render(
      <Pagination
        page={2}
        totalPages={5}
        basePath="/"
        searchParams={{ search: 'cafe' }}
      />,
    );

    // Na pagina 2+ o botao "Anterior" aponta para a pagina 1 sem o parametro
    // "page", mas mantendo o filtro de busca.
    const prev = screen.getByRole('link', { name: /anterior/i });
    expect(prev).toHaveAttribute('href', '/?search=cafe');

    const next = screen.getByRole('link', { name: /proxima/i });
    expect(next).toHaveAttribute('href', '/?search=cafe&page=3');
  });

  it('usa basePath correto na pagina de pedidos', () => {
    render(<Pagination page={1} totalPages={4} basePath="/orders" />);

    expect(screen.getByRole('link', { name: /proxima/i })).toHaveAttribute(
      'href',
      '/orders?page=2',
    );
  });
});
