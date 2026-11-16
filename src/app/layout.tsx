import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/components/CartProvider';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'Marketplace Modular',
  description:
    'Marketplace como monolito modular - Catalogo, Pedidos e Pagamentos.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        <CartProvider>
          <Header />
          <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
