'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';

const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 11.5A8 8 0 0 0 6.3 6.3L4 8.5" />
    <path d="M4 4.5v4h4" />
    <path d="M4 12.5a8 8 0 0 0 13.7 5.2L20 15.5" />
    <path d="M20 19.5v-4h-4" />
  </svg>
);

/** Tombol "Refresh Status" — memuat ulang data status dari server. */
export function RefreshStatusButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy text-sm font-bold text-white transition-all hover:bg-stone-800 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
    >
      <RefreshIcon className={`h-[18px] w-[18px] ${isPending ? 'animate-spin' : ''}`} />
      {isPending ? 'Memuat status…' : 'Refresh Status'}
    </button>
  );
}
