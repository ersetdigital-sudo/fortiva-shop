import {
  CATEGORIES_CONFIG,
  NOMINALS_BY_CATEGORY,
  PROVIDERS_BY_CATEGORY,
} from '@/data/products';
import type { NominalItem, ProviderItem } from '@/types';

/**
 * Bentuk katalog yang dipakai seluruh halaman toko.
 * Modul ini SENGAJA bebas dari Supabase/node agar bisa dipakai di client.
 */

export interface CategoryConfigEntry {
  name: string;
  label: string;
  inputLabel: string;
  inputPlaceholder: string;
  helperText: string;
}

export interface CatalogCategory {
  slug: string;
  name: string;
  label: string;
  imageUrl: string | null;
  sortOrder: number;
}

export interface BankAccountItem {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  logoUrl: string | null;
  sortOrder: number;
}

export interface Catalog {
  /** Konfigurasi per kategori (dulu `CATEGORIES_CONFIG`). */
  categoriesConfig: Record<string, CategoryConfigEntry>;
  /** Provider per kategori (dulu `PROVIDERS_BY_CATEGORY`). */
  providersByCategory: Record<string, ProviderItem[]>;
  /** Nominal per kategori (dulu `NOMINALS_BY_CATEGORY`). */
  nominalsByCategory: Record<string, NominalItem[]>;
  /** Daftar kategori aktif, terurut. */
  categories: CatalogCategory[];
  /** Pengaturan situs dari tabel `settings` (nomor WA, QRIS, teks hero, dsb). */
  settings: Record<string, string>;
  /** Rekening bank aktif dari tabel `bank_accounts`. */
  bankAccounts: BankAccountItem[];
  source: 'database' | 'fallback';
}

/** Nilai bawaan — dipakai bila tabel `settings` belum terisi / DB tidak terjangkau. */
export const FALLBACK_SETTINGS: Record<string, string> = {
  site_name: 'Fortiva Shop',
  whatsapp_cs: '6281234567890',
  whatsapp_label: 'CS WhatsApp · 08.00–22.00 WIB',
  qris_image_url: '',
  qris_merchant: 'Fortiva Shop',
  payment_instructions:
    'Scan QRIS dengan aplikasi bank atau e-wallet apa pun. Pembayaran diverifikasi otomatis dalam 1–5 detik.',
  announcement: 'GATEWAY PPOB AKTIF 24 JAM',
  hero_title: 'Urus Tagihan & Isi Saldo,',
  hero_title_accent: 'Tanpa Ribet.',
  hero_subtitle:
    'Dari pulsa dan paket data hingga token listrik PLN dan tagihan rutin — semua dalam satu tempat, dibayar praktis pakai QRIS.',
  support_email: 'cs@fortivashop.id',
};

/** Nomor CS cadangan bila pengaturan kosong. */
export const DEFAULT_WHATSAPP_CS = '6281234567890';

/** Ambil pengaturan dengan nilai cadangan. */
export function setting(
  settings: Record<string, string>,
  key: string,
  fallback = ''
): string {
  const value = settings[key];
  return value && value.trim() ? value : fallback;
}

/** Bangun link WhatsApp CS dari pengaturan toko. */
export function whatsappUrl(settings: Record<string, string>, message: string): string {
  const raw = setting(settings, 'whatsapp_cs', DEFAULT_WHATSAPP_CS).replace(/\D/g, '');
  return `https://wa.me/${raw}?text=${encodeURIComponent(message)}`;
}

/** Dipakai saat database belum bisa dihubungi — toko tetap tampil normal. */
export const FALLBACK_CATALOG: Catalog = {
  categoriesConfig: { ...CATEGORIES_CONFIG } as Record<string, CategoryConfigEntry>,
  providersByCategory: { ...PROVIDERS_BY_CATEGORY } as Record<string, ProviderItem[]>,
  nominalsByCategory: { ...NOMINALS_BY_CATEGORY } as Record<string, NominalItem[]>,
  categories: Object.entries(CATEGORIES_CONFIG).map(([slug, config], index) => ({
    slug,
    name: config.name,
    label: config.label,
    imageUrl: null,
    sortOrder: index + 1,
  })),
  settings: { ...FALLBACK_SETTINGS },
  bankAccounts: [],
  source: 'fallback',
};
