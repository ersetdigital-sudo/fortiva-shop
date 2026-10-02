'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteProduct, saveProduct, type ProductInput } from '@/app/admin/(dashboard)/actions';
import { ImageUploader } from './ImageUploader';
import {
  Badge,
  EmptyState,
  btnDanger,
  btnPrimary,
  btnSecondary,
  inputClass,
  labelClass,
} from './ui';
import { formatRupiah } from '@/lib/format';
import { cldUrl } from '@/lib/cloudinary-url';

export interface ProductRow {
  id: string;
  category_slug: string;
  provider_code: string | null;
  label: string;
  description: string;
  price: number | string;
  badge: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface CategoryOption {
  slug: string;
  label: string;
}

export interface ProviderOption {
  id: string;
  category_slug: string;
  code: string;
  name: string;
}

interface FormState {
  id?: string;
  categorySlug: string;
  providerCode: string;
  label: string;
  description: string;
  price: string;
  badge: '' | 'POPULER' | 'HEMAT' | 'PROMO';
  imageUrl: string;
  sortOrder: string;
  isActive: boolean;
}

function emptyForm(categorySlug: string): FormState {
  return {
    categorySlug,
    providerCode: '',
    label: '',
    description: '',
    price: '',
    badge: '',
    imageUrl: '',
    sortOrder: '0',
    isActive: true,
  };
}

const BADGE_TONES: Record<string, 'red' | 'green' | 'yellow'> = {
  POPULER: 'red',
  HEMAT: 'green',
  PROMO: 'yellow',
};

export function ProductsClient({
  initialProducts,
  categories,
  providers,
}: {
  initialProducts: ProductRow[];
  categories: CategoryOption[];
  providers: ProviderOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [filterCategory, setFilterCategory] = useState('ALL');
  const [query, setQuery] = useState('');
  const [form, setForm] = useState<FormState | null>(null);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const providerName = useMemo(() => {
    const map = new Map<string, string>();
    for (const provider of providers) {
      map.set(`${provider.category_slug}:${provider.code}`, provider.name);
    }
    return map;
  }, [providers]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return initialProducts.filter((product) => {
      if (filterCategory !== 'ALL' && product.category_slug !== filterCategory) return false;
      if (!needle) return true;
      return (
        product.label.toLowerCase().includes(needle) ||
        product.description.toLowerCase().includes(needle) ||
        product.category_slug.toLowerCase().includes(needle)
      );
    });
  }, [initialProducts, filterCategory, query]);

  const providersForForm = form
    ? providers.filter((provider) => provider.category_slug === form.categorySlug)
    : [];

  const submit = () => {
    if (!form) return;

    const payload: ProductInput = {
      id: form.id,
      categorySlug: form.categorySlug,
      providerCode: form.providerCode,
      label: form.label,
      description: form.description,
      price: Number(form.price) || 0,
      badge: form.badge,
      imageUrl: form.imageUrl,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    };

    startTransition(async () => {
      const result = await saveProduct(payload);
      setMessage(
        result.ok
          ? { tone: 'ok', text: form.id ? 'Produk diperbarui.' : 'Produk ditambahkan.' }
          : { tone: 'error', text: result.error ?? 'Gagal menyimpan.' }
      );
      if (result.ok) {
        setForm(null);
        router.refresh();
      }
    });
  };

  const remove = (product: ProductRow) => {
    if (!confirm(`Hapus produk "${product.label}"?`)) return;
    startTransition(async () => {
      const result = await deleteProduct(product.id);
      setMessage(
        result.ok
          ? { tone: 'ok', text: 'Produk dihapus.' }
          : { tone: 'error', text: result.error ?? 'Gagal menghapus.' }
      );
      if (result.ok) router.refresh();
    });
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={filterCategory}
          onChange={(event) => setFilterCategory(event.target.value)}
          className={`${inputClass} w-auto min-w-[160px]`}
        >
          <option value="ALL">Semua kategori</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.label}
            </option>
          ))}
        </select>

        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari produk…"
          className={`${inputClass} w-full sm:max-w-xs`}
        />

        <button
          type="button"
          onClick={() => setForm(emptyForm(categories[0]?.slug ?? 'pulsa'))}
          className={`${btnPrimary} ml-auto`}
          disabled={categories.length === 0}
        >
          + Tambah Produk
        </button>
      </div>

      {message && (
        <p
          className={`mb-4 rounded-xl border px-3.5 py-2.5 text-[12px] font-medium ${
            message.tone === 'ok'
              ? 'border-[#16803C]/25 bg-[#16803C]/5 text-[#16803C]'
              : 'border-[#F2352B]/25 bg-[#F2352B]/5 text-[#F2352B]'
          }`}
        >
          {message.text}
        </p>
      )}

      {visible.length === 0 ? (
        <EmptyState
          icon="📦"
          title="Belum ada produk"
          description="Tambahkan nominal atau paket pertama untuk kategori ini."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#E5E3DC] bg-white shadow-sm">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#EFEDE7] text-[10px] uppercase tracking-[0.06em] text-[#6B7280]">
                <th className="px-5 py-3 font-bold">Produk</th>
                <th className="px-5 py-3 font-bold">Kategori</th>
                <th className="px-5 py-3 font-bold">Provider</th>
                <th className="px-5 py-3 text-right font-bold">Harga</th>
                <th className="px-5 py-3 font-bold">Status</th>
                <th className="px-5 py-3 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((product) => (
                <tr key={product.id} className="border-b border-[#F5F4F0] last:border-0 hover:bg-[#F7F6F2]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cldUrl(product.image_url, { w: 80, h: 80 })}
                          alt={product.label}
                          loading="lazy"
                          className="h-9 w-9 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F7F6F2] text-[13px]">
                          📦
                        </span>
                      )}
                      <div>
                        <p className="text-[12px] font-semibold text-[#111827]">{product.label}</p>
                        <p className="text-[11px] text-[#6B7280]">{product.description || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[12px] text-[#374151]">{product.category_slug}</td>
                  <td className="px-5 py-3 text-[12px] text-[#374151]">
                    {product.provider_code
                      ? (providerName.get(`${product.category_slug}:${product.provider_code}`) ??
                        product.provider_code)
                      : '—'}
                  </td>
                  <td className="num-tabular px-5 py-3 text-right text-[12px] font-semibold text-[#111827]">
                    {formatRupiah(product.price)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {product.is_active ? (
                        <Badge tone="green">Aktif</Badge>
                      ) : (
                        <Badge tone="gray">Nonaktif</Badge>
                      )}
                      {product.badge && (
                        <Badge tone={BADGE_TONES[product.badge] ?? 'gray'}>{product.badge}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            id: product.id,
                            categorySlug: product.category_slug,
                            providerCode: product.provider_code ?? '',
                            label: product.label,
                            description: product.description,
                            price: String(product.price),
                            badge: (product.badge ?? '') as FormState['badge'],
                            imageUrl: product.image_url ?? '',
                            sortOrder: String(product.sort_order),
                            isActive: product.is_active,
                          })
                        }
                        className={`${btnSecondary} !px-3 !py-1.5 !text-[11px]`}
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => remove(product)}
                        className={btnDanger}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
          <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E5E3DC] bg-white shadow-xl">
            <header className="flex items-start justify-between gap-3 border-b border-[#EFEDE7] px-5 py-4">
              <h2 className="text-[15px] font-bold text-[#111827]">
                {form.id ? 'Ubah Produk' : 'Tambah Produk'}
              </h2>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="rounded-lg px-2 py-1 text-[16px] text-[#6B7280] hover:bg-[#F7F6F2]"
                aria-label="Tutup"
              >
                ✕
              </button>
            </header>

            <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2">
              <div>
                <label htmlFor="prod-category" className={labelClass}>
                  Kategori
                </label>
                <select
                  id="prod-category"
                  value={form.categorySlug}
                  onChange={(event) =>
                    setForm({ ...form, categorySlug: event.target.value, providerCode: '' })
                  }
                  className={inputClass}
                >
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="prod-provider" className={labelClass}>
                  Provider <span className="text-[11px] font-normal text-[#6B7280]">(opsional)</span>
                </label>
                <select
                  id="prod-provider"
                  value={form.providerCode}
                  onChange={(event) => setForm({ ...form, providerCode: event.target.value })}
                  className={inputClass}
                >
                  <option value="">— Tidak spesifik —</option>
                  {providersForForm.map((provider) => (
                    <option key={provider.id} value={provider.code}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="prod-label" className={labelClass}>
                  Label Nominal
                </label>
                <input
                  id="prod-label"
                  value={form.label}
                  onChange={(event) => setForm({ ...form, label: event.target.value })}
                  placeholder="mis. 25.000 atau 14 GB / 30 Hari"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="prod-price" className={labelClass}>
                  Harga Jual (Rp)
                </label>
                <input
                  id="prod-price"
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(event) => setForm({ ...form, price: event.target.value })}
                  placeholder="25750"
                  className={`${inputClass} num-tabular`}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="prod-desc" className={labelClass}>
                  Deskripsi
                </label>
                <input
                  id="prod-desc"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="mis. Aktif +30 hari"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="prod-badge" className={labelClass}>
                  Badge
                </label>
                <select
                  id="prod-badge"
                  value={form.badge}
                  onChange={(event) =>
                    setForm({ ...form, badge: event.target.value as FormState['badge'] })
                  }
                  className={inputClass}
                >
                  <option value="">Tanpa badge</option>
                  <option value="POPULER">POPULER</option>
                  <option value="HEMAT">HEMAT</option>
                  <option value="PROMO">PROMO</option>
                </select>
              </div>

              <div>
                <label htmlFor="prod-order" className={labelClass}>
                  Urutan
                </label>
                <input
                  id="prod-order"
                  type="number"
                  value={form.sortOrder}
                  onChange={(event) => setForm({ ...form, sortOrder: event.target.value })}
                  className={`${inputClass} num-tabular`}
                />
              </div>

              <div className="sm:col-span-2">
                <ImageUploader
                  label="Gambar Produk"
                  value={form.imageUrl}
                  onChange={(url) => setForm((prev) => (prev ? { ...prev, imageUrl: url } : prev))}
                  folder="fortiva/produk"
                  aspect="square"
                />
              </div>

              <label className="flex items-center gap-2.5 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                  className="h-4 w-4 rounded border-[#E5E3DC] accent-[#F2352B]"
                />
                <span className="text-[13px] font-semibold text-[#111827]">
                  Tampilkan di halaman toko
                </span>
              </label>
            </div>

            <footer className="flex justify-end gap-2 border-t border-[#EFEDE7] px-5 py-4">
              <button type="button" onClick={() => setForm(null)} className={btnSecondary}>
                Batal
              </button>
              <button type="button" disabled={isPending} onClick={submit} className={btnPrimary}>
                {isPending ? 'Menyimpan…' : 'Simpan Produk'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
