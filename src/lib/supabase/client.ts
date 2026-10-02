'use client';

import { createBrowserClient } from '@supabase/ssr';

let cached: ReturnType<typeof createBrowserClient> | null = null;

/** Supabase client untuk browser (anon key). Dipakai login/logout dari sisi klien. */
export function supabaseBrowser() {
  if (cached) return cached;

  cached = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  );

  return cached;
}
