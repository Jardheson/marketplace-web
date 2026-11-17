/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  // Dev e build de producao usam diretorios distintos. Sem isso, rodar
  // `next build` com o dev server ligado sobrescreve o cache do dev e gera
  // o erro "ENOENT .next/server/pages/_document.js".
  distDir: isDev ? '.next-dev' : '.next',
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    // O lint e executado separadamente via `npm run lint`.
    // Evita que o build fique aguardando o prompt interativo do ESLint.
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
