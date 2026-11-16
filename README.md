# Marketplace Modular - Web

Frontend do Marketplace Modular (M4 Full Cycle) construido com Next.js 15,
React 19 e Tailwind CSS 4. Consome a API publica do backend (Express + TypeORM)
hospedada no Railway.

## Funcionalidades

- Catalogo de produtos com busca e paginacao
- Detalhe do produto com controle de quantidade
- Carrinho persistente (localStorage)
- Checkout com 3 metodos de pagamento (PIX, Cartao de Credito, Boleto)
- Lista de pedidos com filtros por cliente e status
- Detalhe do pedido com itens e total
- Painel de pagamentos (processamento manual por ID do pedido)
- Painel de metricas em tempo real (RED + pedidos + pagamentos)
- Link direto para o Swagger/OpenAPI da API

## Tecnologias

- Next.js 15 (App Router, Server Components)
- React 19
- Tailwind CSS 4
- TypeScript 5
- Deploy na Vercel

## Como rodar localmente

```bash
npm install
cp .env.example .env.local
# Edite .env.local com a URL da sua API
npm run dev
```

A aplicacao ficara disponivel em http://localhost:3000

## Variaveis de ambiente

| Variavel               | Descricao                     | Padrao                     |
| ---------------------- | ----------------------------- | -------------------------- |
| `NEXT_PUBLIC_API_URL`  | URL base da API do marketplace | `http://localhost:3000`    |

## Deploy na Vercel

1. Importe este repositorio no Vercel
2. Em **Settings → Environment Variables**, defina `NEXT_PUBLIC_API_URL`
   com a URL publica da API (ex: `https://imaginative-communication.up.railway.app`)
3. Deploy automatico a cada push na `main`

## Estrutura

```
src/
├── app/
│   ├── api/checkout/route.ts    # Route Handler para checkout
│   ├── api/payments/route.ts    # Route Handler para pagamentos
│   ├── products/[id]/page.tsx   # Detalhe do produto
│   ├── orders/[id]/page.tsx     # Detalhe do pedido
│   ├── orders/page.tsx          # Lista de pedidos
│   ├── payments/page.tsx        # Painel de pagamentos
│   ├── metrics/page.tsx         # Painel de metricas
│   ├── checkout/page.tsx        # Checkout
│   ├── not-found.tsx            # Pagina 404
│   ├── layout.tsx               # Layout raiz
│   ├── page.tsx                 # Catalogo (home)
│   └── globals.css              # Tailwind
├── components/                  # Componentes React
└── lib/
    ├── api.ts                   # Cliente da API + formatacao
    └── types.ts                 # Tipos TypeScript (espelho do OpenAPI)
```

## Autor

Jardheson Oliveira
