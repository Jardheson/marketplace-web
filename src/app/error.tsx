'use client';

import { useEffect } from 'react';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center sm:py-20">
      <div aria-hidden className="text-5xl sm:text-6xl">
        ⚠️
      </div>
      <h1 className="mt-4 text-xl font-semibold sm:text-2xl">
        Algo deu errado
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        Nao foi possivel carregar esta pagina. Verifique se a API esta
        disponivel e tente novamente.
      </p>
      {error.message && (
        <p
          role="alert"
          className="mt-3 max-w-md break-all rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger"
        >
          {error.message}
        </p>
      )}
      <button
        type="button"
        onClick={reset}
        className="mt-6 flex min-h-[44px] items-center justify-center rounded-xl bg-accent px-5 text-sm font-medium text-white transition hover:bg-accent-hover"
      >
        Tentar novamente
      </button>
    </div>
  );
}
