import { NextResponse } from 'next/server';
import { createProduct } from '@/lib/api';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const URL_REGEX = /^https?:\/\/\S+$/i;

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'JSON invalido' } },
        { status: 400 },
      );
    }

    const { name, description, price, stock, categoryId, sku, imageUrl } = (body ??
      {}) as {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      categoryId?: string;
      sku?: string;
      imageUrl?: string;
    };

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Nome deve ter ao menos 2 caracteres' } },
        { status: 400 },
      );
    }

    if (!categoryId || !UUID_REGEX.test(categoryId)) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'ID da categoria invalido (UUID esperado)' } },
        { status: 400 },
      );
    }

    if (!sku || typeof sku !== 'string' || sku.trim().length === 0) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'SKU obrigatorio' } },
        { status: 400 },
      );
    }

    const priceCents = Number(price);
    if (!Number.isInteger(priceCents) || priceCents < 1) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Preco deve ser um inteiro em centavos maior que zero' } },
        { status: 400 },
      );
    }

    const stockNumber = Number(stock);
    if (!Number.isInteger(stockNumber) || stockNumber < 0) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Estoque deve ser um inteiro maior ou igual a zero' } },
        { status: 400 },
      );
    }

    if (imageUrl !== undefined && imageUrl !== null) {
      if (
        typeof imageUrl !== 'string' ||
        imageUrl.trim().length === 0 ||
        imageUrl.trim().length > 500 ||
        !URL_REGEX.test(imageUrl.trim())
      ) {
        return NextResponse.json(
          {
            error: {
              code: 'BAD_REQUEST',
              message: 'URL da imagem invalida (use http ou https, ate 500 caracteres)',
            },
          },
          { status: 400 },
        );
      }
    }

    const product = await createProduct({
      name: name.trim(),
      description: description?.trim() || undefined,
      price: priceCents,
      stock: stockNumber,
      categoryId,
      sku: sku.trim(),
      imageUrl: typeof imageUrl === 'string' ? imageUrl.trim() : undefined,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error && err.message.length < 200
        ? err.message
        : 'Erro no servidor';
    return NextResponse.json(
      { error: { code: 'PRODUCT_ERROR', message } },
      { status: 500 },
    );
  }
}
