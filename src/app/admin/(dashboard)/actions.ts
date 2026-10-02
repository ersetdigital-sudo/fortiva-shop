'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient, getAdminUser } from '@/lib/supabase/server';

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

const DENIED: ActionResult = { ok: false, error: 'Tidak diizinkan.' };

async function requireAdmin() {
  return getAdminUser();
}

function revalidateAll() {
  revalidatePath('/admin');
  revalidatePath('/admin/produk');
  revalidatePath('/admin/kategori');
  revalidatePath('/admin/pesanan');
  revalidatePath('/admin/pengaturan');
  revalidatePath('/');
}

function fail(error: unknown): ActionResult {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message: unknown }).message)
        : 'Terjadi kesalahan.';
  return { ok: false, error: message };
}

/* ================================================================== *
 * KATEGORI
 * ================================================================== */
export interface CategoryInput {
  /** Slug lama, diisi saat mengedit (slug adalah primary key bisnis). */
  originalSlug?: string;
  slug: string;
  name: string;
  label: string;
  inputLabel: string;
  inputPlaceholder: string;
  helperText: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export async function saveCategory(input: CategoryInput): Promise<ActionResult> {
  if (!(await requireAdmin())) return DENIED;

  const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!slug) return { ok: false, error: 'Slug wajib diisi (huruf kecil, angka, strip).' };
  if (!input.name.trim()) return { ok: false, error: 'Nama kategori wajib diisi.' };

  try {
    const supabase = createAdminClient();
    const row = {
      slug,
      name: input.name.trim(),
      label: input.label.trim() || input.name.trim(),
      input_label: input.inputLabel.trim(),
      input_placeholder: input.inputPlaceholder.trim(),
      helper_text: input.helperText.trim(),
      image_url: input.imageUrl || null,
      sort_order: Number(input.sortOrder) || 0,
      is_active: input.isActive,
    };

    const original = input.originalSlug?.trim().toLowerCase();
    if (original && original !== slug) {
      const { error } = await supabase.from('categories').update(row).eq('slug', original);
      if (error) return fail(error);
    } else {
      const { error } = await supabase.from('categories').upsert(row, { onConflict: 'slug' });
      if (error) return fail(error);
    }

    revalidateAll();
    return { ok: true, id: slug };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteCategory(slug: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return DENIED;

  try {
    const { error } = await createAdminClient().from('categories').delete().eq('slug', slug);
    if (error) return fail(error);
    revalidateAll();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* ================================================================== *
 * PROVIDER
 * ================================================================== */
export interface ProviderInput {
  id?: string;
  categorySlug: string;
  name: string;
  code: string;
  shortName: string;
  bgColor: string;
  textColor: string;
  logoUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export async function saveProvider(input: ProviderInput): Promise<ActionResult> {
  if (!(await requireAdmin())) return DENIED;

  const code = input.code.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
  if (!code) return { ok: false, error: 'Kode provider wajib diisi (huruf/angka).' };
  if (!input.name.trim()) return { ok: false, error: 'Nama provider wajib diisi.' };
  if (!input.categorySlug) return { ok: false, error: 'Kategori wajib dipilih.' };

  try {
    const supabase = createAdminClient();
    const row = {
      category_slug: input.categorySlug,
      name: input.name.trim(),
      code,
      short_name: input.shortName.trim() || input.name.trim().slice(0, 2),
      bg_color: input.bgColor || '#111827',
      text_color: input.textColor || '#FFFFFF',
      logo_url: input.logoUrl || null,
      sort_order: Number(input.sortOrder) || 0,
      is_active: input.isActive,
    };

    if (input.id) {
      const { error } = await supabase.from('providers').update(row).eq('id', input.id);
      if (error) return fail(error);
      revalidateAll();
      return { ok: true, id: input.id };
    }

    const { data, error } = await supabase
      .from('providers')
      .upsert(row, { onConflict: 'category_slug,code' })
      .select('id')
      .maybeSingle();

    if (error) return fail(error);
    revalidateAll();
    return { ok: true, id: data?.id };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteProvider(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return DENIED;

  try {
    const { error } = await createAdminClient().from('providers').delete().eq('id', id);
    if (error) return fail(error);
    revalidateAll();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* ================================================================== *
 * PRODUK / NOMINAL
 * ================================================================== */
export interface ProductInput {
  id?: string;
  categorySlug: string;
  providerCode: string;
  label: string;
  description: string;
  price: number;
  badge: '' | 'POPULER' | 'HEMAT' | 'PROMO';
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export async function saveProduct(input: ProductInput): Promise<ActionResult> {
  if (!(await requireAdmin())) return DENIED;

  if (!input.label.trim()) return { ok: false, error: 'Label nominal wajib diisi.' };
  if (!input.categorySlug) return { ok: false, error: 'Kategori wajib dipilih.' };
  if (!Number.isFinite(Number(input.price))) return { ok: false, error: 'Harga tidak valid.' };

  try {
    const supabase = createAdminClient();
    const row = {
      category_slug: input.categorySlug,
      provider_code: input.providerCode || null,
      label: input.label.trim(),
      description: input.description.trim(),
      price: Number(input.price) || 0,
      badge: input.badge || null,
      image_url: input.imageUrl || null,
      sort_order: Number(input.sortOrder) || 0,
      is_active: input.isActive,
    };

    if (input.id) {
      const { error } = await supabase.from('products').update(row).eq('id', input.id);
      if (error) return fail(error);
      revalidateAll();
      return { ok: true, id: input.id };
    }

    const { data, error } = await supabase.from('products').insert(row).select('id').maybeSingle();
    if (error) return fail(error);
    revalidateAll();
    return { ok: true, id: data?.id };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return DENIED;

  try {
    const { error } = await createAdminClient().from('products').delete().eq('id', id);
    if (error) return fail(error);
    revalidateAll();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* ================================================================== *
 * PESANAN
 * ================================================================== */
export async function updateOrderStatus(
  id: string,
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'
): Promise<ActionResult> {
  if (!(await requireAdmin())) return DENIED;

  try {
    const { error } = await createAdminClient()
      .from('orders')
      .update({ status })
      .eq('id', id);
    if (error) return fail(error);
    revalidateAll();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function updateOrderDetails(
  id: string,
  details: { serialNumber: string; tokenPln: string; customerNote: string }
): Promise<ActionResult> {
  if (!(await requireAdmin())) return DENIED;

  try {
    const { error } = await createAdminClient()
      .from('orders')
      .update({
        serial_number: details.serialNumber || null,
        token_pln: details.tokenPln || null,
        customer_note: details.customerNote || null,
      })
      .eq('id', id);
    if (error) return fail(error);
    revalidateAll();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteOrder(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return DENIED;

  try {
    const { error } = await createAdminClient().from('orders').delete().eq('id', id);
    if (error) return fail(error);
    revalidateAll();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* ================================================================== *
 * PENGATURAN SITUS
 * ================================================================== */
export async function saveSettings(entries: Record<string, string>): Promise<ActionResult> {
  if (!(await requireAdmin())) return DENIED;

  const rows = Object.entries(entries).map(([key, value]) => ({ key, value: value ?? '' }));
  if (rows.length === 0) return { ok: true };

  try {
    const { error } = await createAdminClient()
      .from('settings')
      .upsert(rows, { onConflict: 'key' });
    if (error) return fail(error);
    revalidateAll();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* ================================================================== *
 * REKENING BANK
 * ================================================================== */
export interface BankAccountInput {
  id?: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  logoUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export async function saveBankAccount(input: BankAccountInput): Promise<ActionResult> {
  if (!(await requireAdmin())) return DENIED;

  if (!input.bankName.trim()) return { ok: false, error: 'Nama bank wajib diisi.' };
  if (!input.accountNumber.trim()) return { ok: false, error: 'Nomor rekening wajib diisi.' };
  if (!input.accountName.trim()) return { ok: false, error: 'Nama pemilik rekening wajib diisi.' };

  try {
    const supabase = createAdminClient();
    const row = {
      bank_name: input.bankName.trim(),
      account_number: input.accountNumber.trim(),
      account_name: input.accountName.trim(),
      logo_url: input.logoUrl || null,
      sort_order: Number(input.sortOrder) || 0,
      is_active: input.isActive,
    };

    if (input.id) {
      const { error } = await supabase.from('bank_accounts').update(row).eq('id', input.id);
      if (error) return fail(error);
      revalidateAll();
      return { ok: true, id: input.id };
    }

    const { data, error } = await supabase
      .from('bank_accounts')
      .insert(row)
      .select('id')
      .maybeSingle();
    if (error) return fail(error);
    revalidateAll();
    return { ok: true, id: data?.id };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteBankAccount(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return DENIED;

  try {
    const { error } = await createAdminClient().from('bank_accounts').delete().eq('id', id);
    if (error) return fail(error);
    revalidateAll();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}
