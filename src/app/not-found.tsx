import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-6xl font-bold text-violet-500">404</h1>
      <p className="mt-4 text-lg text-neutral-400">Pagina nao encontrada.</p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
      >
        Voltar ao catalogo
      </Link>
    </div>
  );
}
