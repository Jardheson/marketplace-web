export default function Loading() {
  return (
    <div className="space-y-10">
      <div className="h-64 rounded-3xl skeleton" />
      <div className="space-y-5">
        <div className="h-6 w-40 rounded-lg skeleton" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-line"
            >
              <div className="aspect-square skeleton" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 rounded skeleton" />
                <div className="h-3 w-1/2 rounded skeleton" />
                <div className="flex items-center justify-between pt-2">
                  <div className="h-5 w-16 rounded skeleton" />
                  <div className="h-7 w-20 rounded-lg skeleton" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
