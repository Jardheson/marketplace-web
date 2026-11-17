import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center sm:py-24">
      <p className="text-6xl font-semibold tracking-tight text-accent sm:text-7xl">
        404
      </p>
      <h1 className="mt-4 text-xl font-semibold sm:text-2xl">
        Pagina nao encontrada
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        O conteudo que voce procura pode ter sido removido ou nunca existiu.
      </p>
      <Link
        href="/"
        className="mt-6 flex min-h-[44px] items-center rounded-xl bg-accent px-5 text-sm font-medium text-white transition hover:bg-accent-hover"
      >
        Voltar ao catalogo
      </Link>
    </div>
  );
}
