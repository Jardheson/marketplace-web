import '@testing-library/jest-dom/vitest';
import { vi, afterEach } from 'vitest';
import React from 'react';

// O auto-cleanup do Testing Library depende dos globais do Vitest, que nao
// estao habilitados neste projeto. Registramos manualmente e apenas quando o
// ambiente DOM existe (testes de rota rodam em ambiente 'node').
afterEach(async () => {
  if (typeof document !== 'undefined') {
    const { cleanup } = await import('@testing-library/react');
    cleanup();
  }
});

// next/link depende do contexto do App Router, que nao existe nos testes de
// unidade. Substituimos por uma ancora simples que preserva href e demais
// atributos (incluindo os de acessibilidade) para permitir as assercoes.
type LinkProps = {
  href?: string | { pathname?: string };
  children?: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children'>;

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: LinkProps) =>
    React.createElement(
      'a',
      { href: typeof href === 'string' ? href : '#', ...rest },
      children,
    ),
}));
