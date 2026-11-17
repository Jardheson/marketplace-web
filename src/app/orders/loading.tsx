export default function Loading() {
  return (
    <section className="space-y-6">
      <div className="h-14 w-64 rounded-xl skeleton" />
      <div className="overflow-hidden rounded-2xl border border-line">
        <div className="h-12 border-b border-line skeleton" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-2 items-center gap-4 border-b border-line px-4 py-4 last:border-0 sm:grid-cols-4 md:grid-cols-6"
          >
            {Array.from({ length: 2 }).map((__, j) => (
              <div key={j} className="h-4 rounded skeleton sm:hidden" />
            ))}
            {Array.from({ length: 4 }).map((__, j) => (
              <div
                key={`sm-${j}`}
                className="hidden h-4 rounded skeleton sm:block"
              />
            ))}
            {Array.from({ length: 2 }).map((__, j) => (
              <div
                key={`md-${j}`}
                className="hidden h-4 rounded skeleton md:block"
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
