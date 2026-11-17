'use client';

import { useState } from 'react';

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase();
}

export function ProductImage({
  name,
  sku,
  imageUrl,
  className = '',
  fallbackClassName = '',
}: {
  name: string;
  sku: string;
  imageUrl?: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const sources = [
    imageUrl?.trim(),
    `/products/${sku.trim().toLowerCase()}.jpg`,
  ].filter((src): src is string => Boolean(src));

  const [index, setIndex] = useState(0);

  if (index >= sources.length) {
    return (
      <span aria-hidden className={fallbackClassName}>
        {initials(name)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={sources[index]}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setIndex((i) => i + 1)}
      className={className}
    />
  );
}
