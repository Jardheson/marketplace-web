'use client';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Nao foi possivel carregar os dados.',
  onRetry,
}: Props) {
  return (
    <div className="rounded-2xl border border-danger/30 bg-danger/5 p-8 text-center">
      <div aria-hidden className="text-4xl">
        ⚠️
      </div>
      <p className="mt-3 text-sm text-danger">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 flex min-h-[44px] items-center justify-center rounded-xl bg-accent px-5 text-sm font-medium text-white transition hover:bg-accent-hover"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
