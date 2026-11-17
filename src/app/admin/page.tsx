import { AdminPanel } from '@/components/AdminPanel';

export const metadata = {
  title: 'Admin - Marketplace Modular',
};

export default function AdminPage() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Administracao</h1>
        <p className="mt-1 text-sm text-muted">
          Cadastre categorias e produtos no catalogo da API.
        </p>
      </header>
      <div className="max-w-2xl">
        <AdminPanel />
      </div>
    </section>
  );
}
