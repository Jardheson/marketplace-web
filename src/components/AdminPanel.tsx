'use client';

import { useEffect, useState } from 'react';
import { formatBRL } from '@/lib/api';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STORAGE_KEY = 'admin.categories';

interface KnownCategory {
  id: string;
  name: string;
}

type Tab = 'category' | 'product';

function loadKnownCategories(): KnownCategory[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as KnownCategory[]) : [];
  } catch {
    return [];
  }
}

export function AdminPanel() {
  const [tab, setTab] = useState<Tab>('category');
  const [knownCategories, setKnownCategories] = useState<KnownCategory[]>([]);

  useEffect(() => {
    setKnownCategories(loadKnownCategories());
  }, []);

  function rememberCategory(category: KnownCategory) {
    setKnownCategories((prev) => {
      const next = [category, ...prev.filter((c) => c.id !== category.id)].slice(
        0,
        50,
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Secoes de administracao"
        className="flex gap-1 rounded-xl border border-line bg-surface p-1"
      >
        <button
          role="tab"
          id="tab-category"
          aria-selected={tab === 'category'}
          aria-controls="panel-category"
          onClick={() => setTab('category')}
          className="flex min-h-[40px] flex-1 items-center justify-center rounded-lg px-4 text-sm font-medium transition"
          style={{
            background: tab === 'category' ? 'var(--color-accent-soft)' : 'transparent',
            color: tab === 'category' ? 'var(--color-ink)' : 'var(--color-muted)',
          }}
        >
          Nova categoria
        </button>
        <button
          role="tab"
          id="tab-product"
          aria-selected={tab === 'product'}
          aria-controls="panel-product"
          onClick={() => setTab('product')}
          className="flex min-h-[40px] flex-1 items-center justify-center rounded-lg px-4 text-sm font-medium transition"
          style={{
            background: tab === 'product' ? 'var(--color-accent-soft)' : 'transparent',
            color: tab === 'product' ? 'var(--color-ink)' : 'var(--color-muted)',
          }}
        >
          Novo produto
        </button>
      </div>

      {tab === 'category' ? (
        <div role="tabpanel" id="panel-category" aria-labelledby="tab-category">
          <CategoryForm onCreated={rememberCategory} />
        </div>
      ) : (
        <div role="tabpanel" id="panel-product" aria-labelledby="tab-product">
          <ProductForm
            knownCategories={knownCategories}
            onCategoryUsed={rememberCategory}
          />
        </div>
      )}
    </div>
  );
}

function CategoryForm({ onCreated }: { onCreated: (c: KnownCategory) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<KnownCategory | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreated(null);

    if (name.trim().length < 2) {
      setError('O nome deve ter ao menos 2 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/catalog/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Erro ao criar categoria');

      const category: KnownCategory = { id: data.id, name: data.name };
      setCreated(category);
      onCreated(category);
      setName('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-line bg-surface p-6 shadow-card"
    >
      <div>
        <h2 className="text-lg font-semibold">Criar categoria</h2>
        <p className="mt-1 text-sm text-muted">
          Categorias precisam existir antes de cadastrar produtos.
        </p>
      </div>

      <label className="block text-sm">
        <span className="text-muted">Nome *</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Eletronicos"
          className="input mt-1.5"
        />
      </label>

      <label className="block text-sm">
        <span className="text-muted">Descricao</span>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Opcional"
          className="input mt-1.5"
        />
      </label>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      {created && (
        <div className="rounded-xl border border-success/30 bg-success/5 p-3 text-sm text-success">
          Categoria <strong>{created.name}</strong> criada.
          <div className="mt-1 font-mono text-xs text-muted break-all">
            {created.id}
          </div>
        </div>
      )}

      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? 'Criando...' : 'Criar categoria'}
      </button>
    </form>
  );
}

function ProductForm({
  knownCategories,
  onCategoryUsed,
}: {
  knownCategories: KnownCategory[];
  onCategoryUsed: (c: KnownCategory) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [previewFailed, setPreviewFailed] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdName, setCreatedName] = useState<string | null>(null);

  const priceCents = Math.round(Number(price.replace(',', '.')) * 100);
  const trimmedImageUrl = imageUrl.trim();
  const imageUrlValid = /^https?:\/\/\S+$/i.test(trimmedImageUrl);

  function handleSelectCategory(id: string) {
    setCategoryId(id);
    const found = knownCategories.find((c) => c.id === id);
    if (found) onCategoryUsed(found);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreatedName(null);

    if (name.trim().length < 2) {
      setError('O nome deve ter ao menos 2 caracteres.');
      return;
    }
    if (!UUID_REGEX.test(categoryId.trim())) {
      setError('Informe um ID de categoria valido (formato UUID).');
      return;
    }
    if (!Number.isInteger(priceCents) || priceCents < 1) {
      setError('Preco invalido. Use um valor maior que zero.');
      return;
    }
    const stockNumber = Number(stock);
    if (!Number.isInteger(stockNumber) || stockNumber < 0) {
      setError('Estoque deve ser um numero inteiro maior ou igual a zero.');
      return;
    }
    if (sku.trim().length === 0) {
      setError('Informe o SKU.');
      return;
    }
    if (trimmedImageUrl.length > 0 && !imageUrlValid) {
      setError('URL da imagem invalida. Use http:// ou https://.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/catalog/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          price: priceCents,
          stock: stockNumber,
          categoryId: categoryId.trim(),
          sku: sku.trim(),
          imageUrl: trimmedImageUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Erro ao criar produto');

      setCreatedName(data.name);
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setSku('');
      setImageUrl('');
      setPreviewFailed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-line bg-surface p-6 shadow-card"
    >
      <div>
        <h2 className="text-lg font-semibold">Criar produto</h2>
        <p className="mt-1 text-sm text-muted">
          O SKU deve ser unico e a categoria precisa existir na API.
        </p>
      </div>

      <label className="block text-sm">
        <span className="text-muted">Nome *</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Fone Bluetooth"
          className="input mt-1.5"
        />
      </label>

      <label className="block text-sm">
        <span className="text-muted">Descricao</span>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Opcional"
          className="input mt-1.5"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-muted">Preco (BRL) *</span>
          <input
            required
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="199,90"
            className="input mt-1.5"
          />
          {priceCents > 0 && (
            <span className="mt-1 block text-xs text-faint">
              Equivale a {formatBRL(priceCents)} ({priceCents} centavos)
            </span>
          )}
        </label>

        <label className="block text-sm">
          <span className="text-muted">Estoque *</span>
          <input
            required
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="50"
            className="input mt-1.5"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="text-muted">SKU *</span>
        <input
          required
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          placeholder="SKU-001"
          className="input mt-1.5"
        />
      </label>

      <div className="space-y-2">
        <label className="block text-sm">
          <span className="text-muted">URL da imagem</span>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setPreviewFailed(false);
            }}
            placeholder="https://exemplo.com/imagem.jpg"
            className="input mt-1.5"
          />
        </label>

        {imageUrlValid && !previewFailed && (
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={trimmedImageUrl}
              alt={`Previa da imagem de ${name || 'produto'}`}
              onError={() => setPreviewFailed(true)}
              className="h-16 w-16 rounded-lg object-cover"
            />
            <span className="text-xs text-muted">Previa da imagem</span>
          </div>
        )}

        {trimmedImageUrl.length > 0 && !imageUrlValid && (
          <p className="text-xs text-danger">
            Informe uma URL valida, iniciando com http:// ou https://.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm">
          <span className="text-muted">ID da categoria (UUID) *</span>
          <input
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            placeholder="00000000-0000-0000-0000-000000000000"
            className="input mt-1.5 font-mono text-xs"
          />
        </label>

        {knownCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {knownCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectCategory(c.id)}
                className="rounded-full border border-line px-3 py-1 text-xs transition hover:border-accent hover:text-accent"
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      {createdName && (
        <div className="rounded-xl border border-success/30 bg-success/5 p-3 text-sm text-success">
          Produto <strong>{createdName}</strong> criado com sucesso.
        </div>
      )}

      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? 'Criando...' : 'Criar produto'}
      </button>
    </form>
  );
}
