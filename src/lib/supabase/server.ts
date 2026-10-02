import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

/**
 * Client yang memakai cookie sesi admin (RLS tetap aktif, berlaku sebagai user login).
 * Dipakai untuk cek identitas admin di server component / action.
 */
export async function createSessionClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Dipanggil dari Server Component (read-only) — aman diabaikan,
          // middleware yang akan menyegarkan sesi.
        }
      },
    },
  });
}

/**
 * Client dengan service role — MELEWATI RLS.
 * Hanya boleh dipakai di server (route handler / server action), jangan pernah di client.
 */
export function createAdminClient(): SupabaseClient {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local');
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Ambil user admin yang sedang login, atau null. */
export async function getAdminUser() {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('user_id, email, full_name')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!adminRow) return null;

  return { id: user.id, email: adminRow.email ?? user.email ?? '', fullName: adminRow.full_name ?? '' };
}
