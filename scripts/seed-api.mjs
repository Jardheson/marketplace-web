#!/usr/bin/env node
// Popula o catalogo via API publica.
//
// Diferente do seed do backend, este script:
//   - NAO acessa o banco diretamente;
//   - NAO executa TRUNCATE (nao apaga nada);
//   - e idempotente por SKU (produto ja existente e ignorado);
//   - reutiliza a categoria existente em execucoes seguintes.
//
// Uso:
//   node scripts/seed-api.mjs --url=https://sua-api.up.railway.app
//   node scripts/seed-api.mjs                 (usa NEXT_PUBLIC_API_URL do .env.local)

import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);

function getArg(name) {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
}

function readEnvLocal() {
  try {
    const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
    const line = raw.split('\n').find((l) => l.startsWith('NEXT_PUBLIC_API_URL='));
    return line ? line.split('=').slice(1).join('=').trim() : undefined;
  } catch {
    return undefined;
  }
}

const BASE_URL = (
  getArg('url') ||
  process.env.NEXT_PUBLIC_API_URL ||
  readEnvLocal() ||
  'http://localhost:3000'
).replace(/\/$/, '');

const API = `${BASE_URL}/api/v1`;
const CATEGORY_NAME = 'Catalogo Demonstracao';
const CATEGORY_DESCRIPTION = 'Itens de demonstracao do marketplace';

// [nome, preco em centavos, estoque]
const PRODUCTS = [
  ['Fone de Ouvido Bluetooth', 19990, 50],
  ['Caixa de Som Portatil', 24990, 35],
  ['Smartwatch Fitness', 34990, 20],
  ['Teclado Mecanico RGB', 42990, 15],
  ['Mouse Sem Fio', 8990, 80],
  ['Webcam Full HD', 27990, 25],
  ['Headset Gamer', 32990, 18],
  ['Carregador Turbo USB-C', 7990, 100],
  ['Power Bank 20000mAh', 15990, 40],
  ['Cabo HDMI 2 metros', 4990, 120],
  ['Suporte para Notebook', 12990, 30],
  ['Hub USB 7 Portas', 13990, 22],
  ['Luminaria LED de Mesa', 9990, 45],
  ['Cafeteira Eletrica', 21990, 12],
  ['Air Fryer 4 Litros', 45990, 10],
  ['Liquidificador 500W', 18990, 16],
  ['Jogo de Panelas 5 Pecas', 39990, 8],
  ['Conjunto de Toalhas', 8990, 25],
  ['Almofada Decorativa', 5990, 60],
  ['Manta Cobertor', 11990, 20],
  ['Organizador de Gaveta', 3990, 90],
  ['Lixeira Inox 15 Litros', 14990, 14],
  ['Porta Temperos', 6990, 35],
  ['Tapete Antiderrapante', 8990, 28],
  ['Caderno Inteligente', 7490, 55],
  ['Caneta Esferografica Kit', 2990, 150],
  ['Mochila para Notebook', 17990, 24],
  ['Bolsa Termica', 9990, 33],
  ['Garrafa Termica 500ml', 8990, 70],
  ['Guarda-Chuva Reforcado', 6990, 40],
  ['Fone Intra-auricular', 5990, 110],
  ['Mousepad Estendido', 4990, 65],
  ['Suporte de Celular', 3990, 85],
  ['Adaptador Bluetooth 5.0', 8990, 38],
  ['Ring Light 10 Polegadas', 13990, 19],
  ['Tripe para Celular', 9990, 27],
];

async function request(path, init) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    /* sem corpo */
  }
  return { status: res.status, body };
}

async function resolveCategoryId() {
  // Reutiliza a categoria de um produto existente (a API nao expoe GET /categories).
  const existing = await request('/products?pageSize=1');
  const first = existing.body?.data?.[0];
  if (first?.categoryId) {
    console.log(`[cat] reutilizando categoria existente ${first.categoryId}`);
    return first.categoryId;
  }

  const created = await request('/categories', {
    method: 'POST',
    body: JSON.stringify({
      name: CATEGORY_NAME,
      description: CATEGORY_DESCRIPTION,
    }),
  });

  if (created.status !== 201 && created.status !== 200) {
    throw new Error(
      `falha ao criar categoria (HTTP ${created.status}): ${JSON.stringify(created.body)}`,
    );
  }

  console.log(`[cat] categoria criada: ${created.body?.id}`);
  return created.body?.id;
}

async function main() {
  console.log(`API: ${API}`);

  const health = await fetch(`${BASE_URL}/health`, { method: 'GET' }).catch(
    () => null,
  );
  if (health && health.status >= 400) {
    console.log(`[aviso] /health respondeu HTTP ${health.status}`);
  }

  const categoryId = await resolveCategoryId();
  if (!categoryId) throw new Error('categoria sem id retornado pela API');

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < PRODUCTS.length; i += 1) {
    const [name, price, stock] = PRODUCTS[i];
    const sku = `MRX-${String(i + 1).padStart(3, '0')}`;

    const res = await request('/products', {
      method: 'POST',
      body: JSON.stringify({ name, price, stock, categoryId, sku }),
    });

    if (res.status === 201 || res.status === 200) {
      created += 1;
      console.log(`[ok]    ${sku}  ${name}`);
    } else if (res.status === 409) {
      skipped += 1;
      console.log(`[skip]  ${sku}  ja existe`);
    } else {
      failed += 1;
      console.log(
        `[erro]  ${sku}  HTTP ${res.status} ${JSON.stringify(res.body)}`,
      );
    }
  }

  console.log('');
  console.log(`Resumo: ${created} criados, ${skipped} ignorados, ${failed} falhas.`);

  const total = await request('/products?pageSize=1');
  console.log(`Total de produtos na API: ${total.body?.total ?? 'desconhecido'}`);

  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(`Falha: ${err.message}`);
  process.exitCode = 1;
});
