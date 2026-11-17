# MERX - Marketplace Web

Frontend do Marketplace Modular (M4 Full Cycle) construido com Next.js 15,
React 19 e Tailwind CSS 4. Consome a API publica do backend (Express + TypeORM)
hospedada no Railway.

Interface 100% em portugues (pt-BR), responsiva de 320px a 4K e construida sobre
um design system com tokens semanticos (cores, sombras e tipografia).

## Funcionalidades

- Catalogo de produtos com busca e paginacao
- Detalhe do produto com controle de quantidade
- Carrinho persistente (localStorage) com remocao de itens no resumo do checkout
- Checkout com 3 metodos de pagamento (PIX, Cartao de Credito, Boleto); o ID do
  cliente ja vem preenchido com um UUID de exemplo
- Lista de pedidos com filtros por cliente e status
- Detalhe do pedido com itens e total
- Painel de pagamentos (processamento manual por ID do pedido)
- Painel de metricas em tempo real (RED + pedidos + pagamentos)
- Painel de administracao (/admin) para criar categorias e produtos
- Link direto para o Swagger/OpenAPI da API
- Estados de carregamento com skeleton screens
- Pagina de erro (error boundary) e pagina 404 customizadas

## Stack

- Next.js 15 (App Router, Server Components, Route Handlers)
- React 19
- Tailwind CSS 4
- TypeScript 5
- Vitest 5 + React Testing Library
- ESLint 9 (next/core-web-vitals + next/typescript)
- Deploy na Vercel

## Como rodar localmente

```bash
npm install
cp .env.example .env.local
# Edite .env.local com a URL da sua API
npm run dev
```

A aplicacao ficara disponivel em http://localhost:3000

## Scripts

| Script             | Descricao                                        |
| ------------------ | ------------------------------------------------ |
| `npm run dev`      | Inicia o servidor de desenvolvimento             |
| `npm run build`    | Gera o build de producao                         |
| `npm run start`    | Sobe o build de producao                         |
| `npm run lint`     | Executa o ESLint                                 |
| `npm test`         | Executa os testes em modo watch                  |
| `npm run test:run` | Executa os testes uma vez (uso em CI)            |
| `npm run seed:api` | Popula o catalogo via API (idempotente por SKU)  |

## Testes

A suite cobre as regras de negocio criticas, a validacao de seguranca das rotas
e a renderizacao dos componentes principais.

```bash
npm run test:run
```

| Area                       | Arquivo                          | O que valida                                                     |
| -------------------------- | -------------------------------- | ---------------------------------------------------------------- |
| Carrinho (regras)          | `components/CartProvider.test.tsx` | Totais, soma de itens, limite de estoque e persistencia          |
| Formatacao e cliente HTTP  | `lib/api.test.ts`                | Moeda BRL, datas pt-BR, query string e tratamento de erro        |
| Rotas de API (seguranca)   | `app/api/**/route.test.ts`       | UUID, metodo de pagamento, quantidades e limite de itens         |
| Componentes                | `components/*.test.tsx`          | ProductCard, Pagination e CheckoutForm                           |

## Acessibilidade

- Skip link para o conteudo principal
- Estados anunciados via `aria-live` (carrinho, erros e status de pagamento)
- Padroes ARIA corretos (`aria-current`, `aria-pressed`, `role=radiogroup`)
- Foco visivel em todos os elementos interativos
- Alvos de toque com no minimo 44px
- Contraste conforme WCAG 2.1 AA
- Respeita `prefers-reduced-motion`

## Seguranca

- Headers HTTP definidos em `next.config.mjs` (HSTS, X-Frame-Options,
  X-Content-Type-Options, Referrer-Policy e Permissions-Policy)
- Validacao de entrada nas Route Handlers (UUID, metodo de pagamento,
  quantidade entre 1 e 999 e limite de 100 itens por pedido)
- Mensagens de erro sanitizadas, sem vazar stack trace
- `poweredByHeader: false` para nao expor a assinatura do framework

## Como popular o catalogo

Ha quatro formas de criar categorias e produtos. A ordem obrigatoria e sempre:
**criar categoria -> criar produto** (a API rejeita produto sem categoria valida
e SKU duplicado).

### 1. Pela interface (/admin)

Acesse `/admin` e use as abas "Nova categoria" e "Novo produto". As categorias
criadas no navegador ficam salvas em `localStorage` para facilitar a selecao.

### 2. Pelo seed do backend (somente local/dev)

O backend possui um seed sintetico que popula 20 categorias, 500 produtos e
100.000 pedidos:

```bash
cd ../Marketplace_Modular
npm run seed
```

> ATENCAO: o seed executa TRUNCATE em todas as tabelas antes de inserir os
> dados. Ele apaga tudo o que existir. Nao rode o seed em producao (Railway).

### 3. Pela API com o script `npm run seed:api`

O script `scripts/seed-api.mjs` cria uma categoria e 36 produtos chamando a API
publica. Diferente do seed do backend, ele:

- NAO acessa o banco diretamente;
- NAO executa TRUNCATE (nao apaga nada);
- e idempotente por SKU (produto ja existente e ignorado);
- reutiliza a categoria existente nas execucoes seguintes.

Por isso e seguro rodar tambem em producao (Railway):

```bash
# usa NEXT_PUBLIC_API_URL do .env.local
npm run seed:api

# ou informa a URL explicitamente
npm run seed:api -- --url=https://SEU-DOMINIO.up.railway.app
```

### 4. Manualmente pela API (curl)

Tambem e possivel criar os registros pela tela `/admin` ou diretamente pela API:

```bash
curl -X POST https://SEU-DOMINIO/api/v1/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Eletronicos"}'

curl -X POST https://SEU-DOMINIO/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Fone Bluetooth","price":19990,"stock":50,"categoryId":"<ID>","sku":"SKU-001"}'
```

O campo `price` e um inteiro em centavos (`19990` = R$ 199,90).

## Variaveis de ambiente

| Variavel               | Descricao                      | Padrao                  |
| ---------------------- | ------------------------------ | ----------------------- |
| `NEXT_PUBLIC_API_URL`  | URL base da API do marketplace | `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_URL` | URL publica do site (Open Graph)| `https://merx.market`  |

## Deploy na Vercel

1. Importe este repositorio na Vercel
2. Em **Settings -> Environment Variables**, defina `NEXT_PUBLIC_API_URL`
   com a URL publica da API (ex: `https://imaginative-communication.up.railway.app`)
3. Deploy automatico a cada push na `main`

> Lembre-se de liberar o CORS no backend para o dominio da Vercel.

## Estrutura

```
scripts/
└── seed-api.mjs                 # Seed do catalogo via API (idempotente)

src/
├── app/
│   ├── admin/                   # Painel de administracao do catalogo
│   ├── api/checkout/route.ts    # Route Handler do checkout
│   ├── api/payments/route.ts    # Route Handler de pagamentos
│   ├── api/catalog/             # Route Handlers de categorias e produtos
│   ├── products/[id]/page.tsx   # Detalhe do produto
│   ├── orders/[id]/page.tsx     # Detalhe do pedido
│   ├── orders/page.tsx          # Lista de pedidos
│   ├── payments/page.tsx        # Painel de pagamentos
│   ├── metrics/page.tsx         # Painel de metricas
│   ├── checkout/page.tsx        # Checkout
│   ├── error.tsx                # Error boundary
│   ├── loading.tsx              # Skeleton do catalogo
│   ├── not-found.tsx            # Pagina 404
│   ├── icon.svg                 # Favicon
│   ├── layout.tsx               # Layout raiz (metadata e fontes)
│   ├── page.tsx                 # Catalogo (home)
│   └── globals.css              # Design system (tokens Tailwind v4)
├── components/                  # Componentes React (+ testes)
└── lib/
    ├── api.ts                   # Cliente da API + formatacao
    └── types.ts                 # Tipos TypeScript (espelho do OpenAPI)
```

## Autor

Jardheson Oliveira
