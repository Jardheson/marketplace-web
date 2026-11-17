import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/components/CartProvider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://merx.market';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'MERX · Marketplace',
    template: '%s · MERX',
  },
  description:
    'MERX - Marketplace moderno. Catalogo, Pedidos e Pagamentos em uma plataforma unica.',
  keywords: ['marketplace', 'e-commerce', 'pedidos', 'pagamentos', 'catalogo', 'MERX'],
  authors: [{ name: 'MERX' }],
  creator: 'MERX',
  publisher: 'MERX',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName: 'MERX',
    title: 'MERX · Marketplace',
    description:
      'MERX - Marketplace moderno. Catalogo, Pedidos e Pagamentos em uma plataforma unica.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'MERX Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MERX · Marketplace',
    description:
      'MERX - Marketplace moderno. Catalogo, Pedidos e Pagamentos em uma plataforma unica.',
    images: ['/og.png'],
    creator: '@merx',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
    shortcut: '/icon.svg',
  },
  alternates: {
    canonical: '/',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="flex min-h-screen flex-col bg-canvas font-sans text-ink antialiased">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Pular para o conteudo
        </a>
        <CartProvider>
          <Header />
          <main
            id="conteudo"
            className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
          >
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
