'use client';

import React from 'react';

interface LogoProps {
  /** Tinggi mark logo (px). Wordmark otomatis menyesuaikan. */
  height?: number;
}

/**
 * Fortiva Shop logo — SVG inline, gaya flat/solid (tanpa gradient).
 * Mark: squircle warna brand + bolt putih + aksen spark kuning.
 */
export const Logo: React.FC<LogoProps> = ({ height = 36 }) => {
  const fontSize = Math.round(height * 0.52);

  return (
    <span className="inline-flex items-center gap-2">
      <svg
        width={height}
        height={height}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Fortiva Shop"
        className="shrink-0"
      >
        {/* Squircle solid brand color (flat, tanpa gradient) */}
        <rect x="2" y="2" width="36" height="36" rx="11" fill="#F2352B" />

        {/* Bolt instan */}
        <path
          d="M24.5 6.5 L13 22.2 L19.6 22.2 L15.5 33.5 L27 17.8 L20.4 17.8 Z"
          fill="#FFFFFF"
        />

        {/* Aksen spark */}
        <circle cx="10.8" cy="29.2" r="2" fill="#FFE78F" />
      </svg>

      <span
        className="font-extrabold tracking-tight leading-none text-brand-navy"
        style={{ fontSize }}
      >
        Fortiva<span className="text-brand-red">Shop</span>
      </span>
    </span>
  );
};
