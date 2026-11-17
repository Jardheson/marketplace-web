# Desempenho e Qualidade - MERX

Resultados verificados do frontend MERX (marketplace-web).

## Stack

- Next.js 15.1.6 (App Router, Server Components, Route Handlers)
- React 19
- Tailwind CSS 4
- TypeScript 5.6
- Vitest 5.1 + React Testing Library 16 + jest-dom
- ESLint 9 (next/core-web-vitals + next/typescript)

## Resultados de build e testes

| Item | Resultado |
| --- | --- |
| `npm run build` | Compila sem erros (14 rotas) |
| `npm run lint` | No ESLint warnings or errors |
| `npm run test:run` | 58 testes passando em 9 arquivos |

### Cobertura de testes por area

| Area | Arquivo | Testes |
| --- | --- | ---: |
| Carrinho (regras de negocio) | `components/CartProvider.test.tsx` | 10 |
| Formatacao e cliente HTTP | `lib/api.test.ts` | 9 |
| Route Handler - checkout | `app/api/checkout/route.test.ts` | 10 |
| Route Handler - payments | `app/api/payments/route.test.ts` | 4 |
| Route Handler - categories | `app/api/catalog/categories/route.test.ts` | 3 |
| Route Handler - products | `app/api/catalog/products/route.test.ts` | 9 |
| Componente ProductCard | `components/ProductCard.test.tsx` | 4 |
| Componente Pagination | `components/Pagination.test.tsx` | 4 |
| Componente CheckoutForm | `components/CheckoutForm.test.tsx` | 5 |
| **Total** | | **58** |

## Acessibilidade (WCAG 2.1 AA)

- Skip link para o conteudo principal
- Estados anunciados via `aria-live` (carrinho, erros e status de pagamento)
- Padroes ARIA corretos: `aria-current`, `aria-pressed`, `role=radiogroup`, `aria-checked`
- Foco visivel em todos os elementos interativos (`focus-visible`)
- Alvos de toque com no minimo 44px
- Contraste conforme WCAG 2.1 AA (tema dark com tokens semanticos)
- Respeita `prefers-reduced-motion`

## Seguranca

### Headers HTTP (definidos em `next.config.mjs`)

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
- `X-XSS-Protection: 1; mode=block`
- `X-DNS-Prefetch-Control: on`
- `poweredByHeader: false`

### Validacao de entrada (Route Handlers)

- UUID validado por regex em `customerId`, `orderId` e `categoryId`
- Metodo de pagamento restrito a whitelist (`PIX`, `CREDIT_CARD`, `BOLETO`)
- Quantidade de itens entre 1 e 999
- Limite de 100 itens por pedido
- Mensagens de erro sanitizadas (sem stack trace)

## Rotas

- 8 rotas de pagina: `/`, `/products/[id]`, `/checkout`, `/orders`, `/orders/[id]`, `/payments`, `/metrics`, `/admin`
- 4 Route Handlers de API: `/api/checkout`, `/api/payments`, `/api/catalog/categories`, `/api/catalog/products`
- Todas respondem HTTP 200 (exceto 404 para rotas inexistentes)
- O build lista 14 entradas: as 12 acima mais `/_not-found` e `/icon.svg`

## Responsividade

- Layout adaptavel de 320px (mobile) a 4K
- Menu hamburguero em telas < md (768px)
- Grid de produtos fluido com breakpoints

## Estado do carrinho

- Persistencia em `localStorage` (chave `marketplace.cart`)
- Remocao de itens no resumo do checkout
- Controle de quantidade respeitando o estoque do produto
- Limite de quantidade por item = estoque disponivel

## Deploy

- Frontend hospedado na Vercel com deploy automatico a cada push na `main`
- Backend (API) hospedado no Railway
- Variavel `NEXT_PUBLIC_API_URL` configurada para apontar para a API do Railway
- CORS liberado no backend para o dominio da Vercel