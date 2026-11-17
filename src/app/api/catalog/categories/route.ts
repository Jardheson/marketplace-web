import { NextResponse } from 'next/server';
import { createCategory } from '@/lib/api';

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

    const { name, description } = (body ?? {}) as {
      name?: string;
      description?: string;
    };

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Nome deve ter ao menos 2 caracteres' } },
        { status: 400 },
      );
    }

    const category = await createCategory({
      name: name.trim(),
      description: description?.trim() || undefined,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error && err.message.length < 200
        ? err.message
        : 'Erro no servidor';
    return NextResponse.json(
      { error: { code: 'CATEGORY_ERROR', message } },
      { status: 500 },
    );
  }
}
