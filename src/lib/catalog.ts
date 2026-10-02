import { createClient } from '@supabase/supabase-js';
import type { NominalItem, ProviderItem } from '@/types';
import {
  FALLBACK_CATALOG,
  FALLBACK_SETTINGS,
  type BankAccountItem,
  type Catalog,
  type CatalogCategory,
  type CategoryConfigEntry,
} from './catalog-types';

/**
 * Memuat katalog toko dari Supabase (hanya baca, memakai anon key —
 * RLS sudah mengizinkan SELECT publik pada tabel katalog).
 *
 * Kalau database belum siap / env belum diisi / terjadi error,
 * kita jatuh ke data statis supaya halaman toko TIDAK pernah blank.
 */

interface CategoryRow {
  slug: string;
  name: string;
  label: string;
  input_label: string;
  input_placeholder: string;
  helper_text: string;
  image_url: string | null;
  sort_order: number;
}

interface ProviderRow {
  id: string;
  category_slug: string;
  name: string;
  code: string;
  short_name: string;
  bg_color: string;
  text_color: string;
}

interface ProductRow {
  id: string;
  category_slug: string;
  label: string;
  description: string;
  price: number | string;
  badge: string | null;
}

interface SettingRow {
  key: string;
  value: string;
}

interface BankAccountRow {
  id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  logo_url: string | null;
  sort_order: number;
}

export async function loadCatalog(): Promise<Catalog> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return FALLBACK_CATALOG;

  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const [categoriesResult, providersResult, productsResult, settingsResult, banksResult] =
      await Promise.all([
      supabase
        .from('categories')
        .select('slug, name, label, input_label, input_placeholder, helper_text, image_url, sort_order')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('providers')
        .select('id, category_slug, name, code, short_name, bg_color, text_color')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('products')
        .select('id, category_slug, label, description, price, badge')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
        supabase.from('settings').select('key, value'),
        supabase
          .from('bank_accounts')
          .select('id, bank_name, account_number, account_name, logo_url, sort_order')
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
      ]);

    const categoryRows = (categoriesResult.data ?? []) as CategoryRow[];
    const providerRows = (providersResult.data ?? []) as ProviderRow[];
    const productRows = (productsResult.data ?? []) as ProductRow[];

    // Katalog kosong -> biarkan toko memakai data statis.
    if (categoryRows.length === 0) return FALLBACK_CATALOG;

    const categoriesConfig: Record<string, CategoryConfigEntry> = {};
    const categories: CatalogCategory[] = [];

    for (const row of categoryRows) {
      categoriesConfig[row.slug] = {
        name: row.name,
        label: row.label,
        inputLabel: row.input_label,
        inputPlaceholder: row.input_placeholder,
        helperText: row.helper_text,
      };

      categories.push({
        slug: row.slug,
        name: row.name,
        label: row.label,
        imageUrl: row.image_url,
        sortOrder: row.sort_order,
      });
    }

    const providersByCategory: Record<string, ProviderItem[]> = {};
    for (const slug of Object.keys(categoriesConfig)) providersByCategory[slug] = [];

    for (const row of providerRows) {
      if (!providersByCategory[row.category_slug]) continue;

      providersByCategory[row.category_slug].push({
        id: row.id,
        name: row.name,
        code: row.code,
        shortName: row.short_name || row.name.slice(0, 2),
        bgColor: row.bg_color,
        textColor: row.text_color,
      });
    }

    const nominalsByCategory: Record<string, NominalItem[]> = {};
    for (const slug of Object.keys(categoriesConfig)) nominalsByCategory[slug] = [];

    for (const row of productRows) {
      if (!nominalsByCategory[row.category_slug]) continue;

      const price = typeof row.price === 'string' ? Number(row.price) : row.price;
      const badge = row.badge;

      nominalsByCategory[row.category_slug].push({
        id: row.id,
        label: row.label,
        description: row.description,
        price: Number.isFinite(price) ? price : 0,
        badge:
          badge === 'POPULER' || badge === 'HEMAT' || badge === 'PROMO' ? badge : undefined,
      });
    }

    // Kategori dari DB tapi belum punya produk -> ambil dari data statis bila ada.
    for (const slug of Object.keys(nominalsByCategory)) {
      if (nominalsByCategory[slug].length === 0 && FALLBACK_CATALOG.nominalsByCategory[slug]) {
        nominalsByCategory[slug] = FALLBACK_CATALOG.nominalsByCategory[slug];
      }
    }

    const settings: Record<string, string> = { ...FALLBACK_SETTINGS };
    for (const row of (settingsResult.data ?? []) as SettingRow[]) {
      settings[row.key] = row.value ?? '';
    }

    const bankAccounts: BankAccountItem[] = ((banksResult.data ?? []) as BankAccountRow[]).map(
      (row) => ({
        id: row.id,
        bankName: row.bank_name,
        accountNumber: row.account_number,
        accountName: row.account_name,
        logoUrl: row.logo_url,
        sortOrder: row.sort_order,
      })
    );

    return {
      categoriesConfig,
      providersByCategory,
      nominalsByCategory,
      categories,
      settings,
      bankAccounts,
      source: 'database',
    };
  } catch {
    return FALLBACK_CATALOG;
  }
}
