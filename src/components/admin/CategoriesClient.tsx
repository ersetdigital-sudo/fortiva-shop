'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  deleteCategory,
  deleteProvider,
  saveCategory,
  saveProvider,
  type CategoryInput,
  type ProviderInput,
} from '@/app/admin/(dashboard)/actions';
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

export interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  label: string;
  input_label: string;
  input_placeholder: string;
  helper_text: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface ProviderRow {
  id: string;
  category_slug: string;
  name: string;
  code: string;
  short_name: string;
  bg_color: string;
  text_color: string;
  logo_url: string | null;
  sort_order: number;
  is_active: boolean;
}

type Tab = 'kategori' | 'provider';

interface CategoryForm {
  originalSlug?: string;
  slug: string;
  name: string;
  label: string;
  inputLabel: string;
  inputPlaceholder: string;
  helperText: string;
  imageUrl: string;
  sortOrder: string;
  isActive: boolean;
}

interface ProviderForm {
  id?: string;
  categorySlug: string;
  name: string;
  code: string;
  shortName: string;
  bgColor: string;
  textColor: string;
  logoUrl: string;
  sortOrder: string;
  isActive: boolean;
}

export function CategoriesClient({
  initialCategories,
  initialProviders,
}: {
  initialCategories: CategoryRow[];
  initialProviders: ProviderRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<Tab>('kategori');
  const [categoryForm, setCategoryForm] = useState<CategoryForm | null>(null);
  const [providerForm, setProviderForm] = useState<ProviderForm | null>(null);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const categoryLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of initialCategories) map.set(category.slug, category.label);
    return map;
  }, [initialCategories]);

  const notify = (result: { ok: boolean; error?: string }, okText: string) => {
    setMessage(
      result.ok ? { tone: 'ok', text: okText } : { tone: 'error', text: result.error ?? 'Gagal.' }
    );
    if (result.ok) router.refresh();
  };

  const submitCategory = () => {
    if (!categoryForm) return;
    const payload: CategoryInput = {
      originalSlug: categoryForm.originalSlug,
      slug: categoryForm.slug,
      name: categoryForm.name,
      label: categoryForm.label,
      inputLabel: categoryForm.inputLabel,
      inputPlaceholder: categoryForm.inputPlaceholder,
      helperText: categoryForm.helperText,
      imageUrl: categoryForm.imageUrl,
      sortOrder: Number(categoryForm.sortOrder) || 0,
      isActive: categoryForm.isActive,
    };

    startTransition(async () => {
      const result = await saveCategory(payload);
      notify(result, categoryForm.originalSlug ? 'Kategori diperbarui.' : 'Kategori ditambahkan.');
      if (result.ok) setCategoryForm(null);
    });
  };

  const submitProvider = () => {
    if (!providerForm) return;
    const payload: ProviderInput = {
      id: providerForm.id,
      categorySlug: providerForm.categorySlug,
      name: providerForm.name,
      code: providerForm.code,
      shortName: providerForm.shortName,
      bgColor: providerForm.bgColor,
      textColor: providerForm.textColor,
      logoUrl: providerForm.logoUrl,
      sortOrder: Number(providerForm.sortOrder) || 0,
      isActive: providerForm.isActive,
    };

    startTransition(async () => {
      const result = await saveProvider(payload);
      notify(result, providerForm.id ? 'Provider diperbarui.' : 'Provider ditambahkan.');
      if (result.ok) setProviderForm(null);
    });
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(['kategori', 'provider'] as Tab[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`rounded-full px-4 py-1.5 text-[12px] font-semibold capitalize transition ${
              tab === item
                ? 'bg-[#111827] text-white'
                : 'border border-[#E5E3DC] bg-white text-[#374151] hover:border-[#111827]/25'
            }`}
          >
            {item}
          </button>
        ))}

        <button
          type="button"
          className={`${btnPrimary} ml-auto`}
          onClick={() => {
            if (tab === 'kategori') {
              setCategoryForm({
                slug: '',
                name: '',
                label: '',
                inputLabel: '',
                inputPlaceholder: '',
                helperText: '',
                imageUrl: '',
                sortOrder: String(initialCategories.length + 1),
                isActive: true,
              });
            } else {
              setProviderForm({
                categorySlug: initialCategories[0]?.slug ?? '',
                name: '',
                code: '',
                shortName: '',
                bgColor: '#111827',
                textColor: '#FFFFFF',
                logoUrl: '',
                sortOrder: '0',
                isActive: true,
              });
            }
          }}
          disabled={initialCategories.length === 0 && tab === 'provider'}
        >
          {tab === 'kategori' ? '+ Tambah Kategori' : '+ Tambah Provider'}
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

      {tab === 'kategori' ? (
        initialCategories.length === 0 ? (
          <EmptyState icon="🗂️" title="Belum ada kategori" />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#E5E3DC] bg-white shadow-sm">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#EFEDE7] text-[10px] uppercase tracking-[0.06em] text-[#6B7280]">
                  <th className="px-5 py-3 font-bold">Kategori</th>
                  <th className="px-5 py-3 font-bold">Slug</th>
                  <th className="px-5 py-3 font-bold">Label Input</th>
                  <th className="px-5 py-3 font-bold">Urutan</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 text-right font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {initialCategories.map((category) => (
                  <tr key={category.id} className="border-b border-[#F5F4F0] last:border-0 hover:bg-[#F7F6F2]">
                    <td className="px-5 py-3">
                      <p className="text-[12px] font-semibold text-[#111827]">{category.label}</p>
                      <p className="text-[11px] text-[#6B7280]">{category.name}</p>
                    </td>
                    <td className="px-5 py-3 font-mono text-[11px] text-[#374151]">{category.slug}</td>
                    <td className="px-5 py-3 text-[12px] text-[#374151]">{category.input_label || '—'}</td>
                    <td className="num-tabular px-5 py-3 text-[12px] text-[#374151]">{category.sort_order}</td>
                    <td className="px-5 py-3">
                      {category.is_active ? <Badge tone="green">Aktif</Badge> : <Badge tone="gray">Nonaktif</Badge>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className={`${btnSecondary} !px-3 !py-1.5 !text-[11px]`}
                          onClick={() =>
                            setCategoryForm({
                              originalSlug: category.slug,
                              slug: category.slug,
                              name: category.name,
                              label: category.label,
                              inputLabel: category.input_label,
                              inputPlaceholder: category.input_placeholder,
                              helperText: category.helper_text,
                              imageUrl: category.image_url ?? '',
                              sortOrder: String(category.sort_order),
                              isActive: category.is_active,
                            })
                          }
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          className={btnDanger}
                          onClick={() => {
                            if (
                              !confirm(
                                `Hapus kategori "${category.label}"? Semua provider & produk di dalamnya ikut terhapus.`
                              )
                            )
                              return;
                            startTransition(async () => {
                              notify(await deleteCategory(category.slug), 'Kategori dihapus.');
                            });
                          }}
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
        )
      ) : initialProviders.length === 0 ? (
        <EmptyState icon="📡" title="Belum ada provider" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#E5E3DC] bg-white shadow-sm">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#EFEDE7] text-[10px] uppercase tracking-[0.06em] text-[#6B7280]">
                <th className="px-5 py-3 font-bold">Provider</th>
                <th className="px-5 py-3 font-bold">Kategori</th>
                <th className="px-5 py-3 font-bold">Kode</th>
                <th className="px-5 py-3 font-bold">Warna</th>
                <th className="px-5 py-3 font-bold">Status</th>
                <th className="px-5 py-3 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {initialProviders.map((provider) => (
                <tr key={provider.id} className="border-b border-[#F5F4F0] last:border-0 hover:bg-[#F7F6F2]">
                  <td className="px-5 py-3">
                    <p className="text-[12px] font-semibold text-[#111827]">{provider.name}</p>
                    <p className="text-[11px] text-[#6B7280]">{provider.short_name}</p>
                  </td>
                  <td className="px-5 py-3 text-[12px] text-[#374151]">
                    {categoryLabel.get(provider.category_slug) ?? provider.category_slug}
                  </td>
                  <td className="px-5 py-3 font-mono text-[11px] text-[#374151]">{provider.code}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-5 w-5 rounded-md border border-black/10"
                        style={{ background: provider.bg_color }}
                        aria-hidden="true"
                      />
                      <span
                        className="h-5 w-5 rounded-md border border-black/10"
                        style={{ background: provider.text_color }}
                        aria-hidden="true"
                      />
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {provider.is_active ? <Badge tone="green">Aktif</Badge> : <Badge tone="gray">Nonaktif</Badge>}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className={`${btnSecondary} !px-3 !py-1.5 !text-[11px]`}
                        onClick={() =>
                          setProviderForm({
                            id: provider.id,
                            categorySlug: provider.category_slug,
                            name: provider.name,
                            code: provider.code,
                            shortName: provider.short_name,
                            bgColor: provider.bg_color,
                            textColor: provider.text_color,
                            logoUrl: provider.logo_url ?? '',
                            sortOrder: String(provider.sort_order),
                            isActive: provider.is_active,
                          })
                        }
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        className={btnDanger}
                        onClick={() => {
                          if (!confirm(`Hapus provider "${provider.name}"?`)) return;
                          startTransition(async () => {
                            notify(await deleteProvider(provider.id), 'Provider dihapus.');
                          });
                        }}
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

      {/* ---------------- Modal Kategori ---------------- */}
      {categoryForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
          <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E5E3DC] bg-white shadow-xl">
            <header className="flex items-start justify-between gap-3 border-b border-[#EFEDE7] px-5 py-4">
              <h2 className="text-[15px] font-bold text-[#111827]">
                {categoryForm.originalSlug ? 'Ubah Kategori' : 'Tambah Kategori'}
              </h2>
              <button
                type="button"
                onClick={() => setCategoryForm(null)}
                className="rounded-lg px-2 py-1 text-[16px] text-[#6B7280] hover:bg-[#F7F6F2]"
                aria-label="Tutup"
              >
                ✕
              </button>
            </header>

            <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2">
              <div>
                <label htmlFor="cat-slug" className={labelClass}>
                  Slug <span className="text-[11px] font-normal text-[#6B7280]">(huruf kecil, unik)</span>
                </label>
                <input
                  id="cat-slug"
                  value={categoryForm.slug}
                  onChange={(event) =>
                    setCategoryForm({ ...categoryForm, slug: event.target.value.toLowerCase() })
                  }
                  placeholder="pln"
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <label htmlFor="cat-label" className={labelClass}>
                  Label Menu
                </label>
                <input
                  id="cat-label"
                  value={categoryForm.label}
                  onChange={(event) => setCategoryForm({ ...categoryForm, label: event.target.value })}
                  placeholder="Token PLN"
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="cat-name" className={labelClass}>
                  Nama Lengkap Kategori
                </label>
                <input
                  id="cat-name"
                  value={categoryForm.name}
                  onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })}
                  placeholder="Token Listrik PLN"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="cat-ilabel" className={labelClass}>
                  Label Kolom Input
                </label>
                <input
                  id="cat-ilabel"
                  value={categoryForm.inputLabel}
                  onChange={(event) =>
                    setCategoryForm({ ...categoryForm, inputLabel: event.target.value })
                  }
                  placeholder="Nomor Meter / ID Pelanggan PLN"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="cat-iph" className={labelClass}>
                  Placeholder Input
                </label>
                <input
                  id="cat-iph"
                  value={categoryForm.inputPlaceholder}
                  onChange={(event) =>
                    setCategoryForm({ ...categoryForm, inputPlaceholder: event.target.value })
                  }
                  placeholder="14xxxxxxxxxx"
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="cat-helper" className={labelClass}>
                  Teks Bantuan
                </label>
                <textarea
                  id="cat-helper"
                  rows={2}
                  value={categoryForm.helperText}
                  onChange={(event) =>
                    setCategoryForm({ ...categoryForm, helperText: event.target.value })
                  }
                  placeholder="20 Digit stroom token otomatis muncul di layar…"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="cat-order" className={labelClass}>
                  Urutan
                </label>
                <input
                  id="cat-order"
                  type="number"
                  value={categoryForm.sortOrder}
                  onChange={(event) =>
                    setCategoryForm({ ...categoryForm, sortOrder: event.target.value })
                  }
                  className={`${inputClass} num-tabular`}
                />
              </div>

              <label className="flex items-end gap-2.5 pb-2">
                <input
                  type="checkbox"
                  checked={categoryForm.isActive}
                  onChange={(event) =>
                    setCategoryForm({ ...categoryForm, isActive: event.target.checked })
                  }
                  className="h-4 w-4 rounded border-[#E5E3DC] accent-[#F2352B]"
                />
                <span className="text-[13px] font-semibold text-[#111827]">Tampilkan di toko</span>
              </label>

              <div className="sm:col-span-2">
                <ImageUploader
                  label="Ikon / Gambar Kategori"
                  value={categoryForm.imageUrl}
                  onChange={(url) =>
                    setCategoryForm((prev) => (prev ? { ...prev, imageUrl: url } : prev))
                  }
                  folder="fortiva/kategori"
                  aspect="square"
                />
              </div>
            </div>

            <footer className="flex justify-end gap-2 border-t border-[#EFEDE7] px-5 py-4">
              <button type="button" onClick={() => setCategoryForm(null)} className={btnSecondary}>
                Batal
              </button>
              <button type="button" disabled={isPending} onClick={submitCategory} className={btnPrimary}>
                {isPending ? 'Menyimpan…' : 'Simpan Kategori'}
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* ---------------- Modal Provider ---------------- */}
      {providerForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
          <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E5E3DC] bg-white shadow-xl">
            <header className="flex items-start justify-between gap-3 border-b border-[#EFEDE7] px-5 py-4">
              <h2 className="text-[15px] font-bold text-[#111827]">
                {providerForm.id ? 'Ubah Provider' : 'Tambah Provider'}
              </h2>
              <button
                type="button"
                onClick={() => setProviderForm(null)}
                className="rounded-lg px-2 py-1 text-[16px] text-[#6B7280] hover:bg-[#F7F6F2]"
                aria-label="Tutup"
              >
                ✕
              </button>
            </header>

            <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2">
              <div>
                <label htmlFor="prov-cat" className={labelClass}>
                  Kategori
                </label>
                <select
                  id="prov-cat"
                  value={providerForm.categorySlug}
                  onChange={(event) =>
                    setProviderForm({ ...providerForm, categorySlug: event.target.value })
                  }
                  className={inputClass}
                >
                  {initialCategories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="prov-name" className={labelClass}>
                  Nama Provider
                </label>
                <input
                  id="prov-name"
                  value={providerForm.name}
                  onChange={(event) => setProviderForm({ ...providerForm, name: event.target.value })}
                  placeholder="Telkomsel"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="prov-code" className={labelClass}>
                  Kode <span className="text-[11px] font-normal text-[#6B7280]">(unik per kategori)</span>
                </label>
                <input
                  id="prov-code"
                  value={providerForm.code}
                  onChange={(event) =>
                    setProviderForm({ ...providerForm, code: event.target.value.toUpperCase() })
                  }
                  placeholder="TSEL"
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <label htmlFor="prov-short" className={labelClass}>
                  Singkatan / Emoji
                </label>
                <input
                  id="prov-short"
                  value={providerForm.shortName}
                  onChange={(event) =>
                    setProviderForm({ ...providerForm, shortName: event.target.value })
                  }
                  placeholder="T"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="prov-bg" className={labelClass}>
                  Warna Latar
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="prov-bg"
                    type="color"
                    value={providerForm.bgColor}
                    onChange={(event) =>
                      setProviderForm({ ...providerForm, bgColor: event.target.value })
                    }
                    className="h-10 w-12 cursor-pointer rounded-lg border border-[#E5E3DC] bg-white p-1"
                  />
                  <input
                    value={providerForm.bgColor}
                    onChange={(event) =>
                      setProviderForm({ ...providerForm, bgColor: event.target.value })
                    }
                    className={`${inputClass} font-mono`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="prov-fg" className={labelClass}>
                  Warna Teks
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="prov-fg"
                    type="color"
                    value={providerForm.textColor}
                    onChange={(event) =>
                      setProviderForm({ ...providerForm, textColor: event.target.value })
                    }
                    className="h-10 w-12 cursor-pointer rounded-lg border border-[#E5E3DC] bg-white p-1"
                  />
                  <input
                    value={providerForm.textColor}
                    onChange={(event) =>
                      setProviderForm({ ...providerForm, textColor: event.target.value })
                    }
                    className={`${inputClass} font-mono`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="prov-order" className={labelClass}>
                  Urutan
                </label>
                <input
                  id="prov-order"
                  type="number"
                  value={providerForm.sortOrder}
                  onChange={(event) =>
                    setProviderForm({ ...providerForm, sortOrder: event.target.value })
                  }
                  className={`${inputClass} num-tabular`}
                />
              </div>

              <label className="flex items-end gap-2.5 pb-2">
                <input
                  type="checkbox"
                  checked={providerForm.isActive}
                  onChange={(event) =>
                    setProviderForm({ ...providerForm, isActive: event.target.checked })
                  }
                  className="h-4 w-4 rounded border-[#E5E3DC] accent-[#F2352B]"
                />
                <span className="text-[13px] font-semibold text-[#111827]">Tampilkan di toko</span>
              </label>

              <div className="sm:col-span-2">
                <ImageUploader
                  label="Logo Provider"
                  value={providerForm.logoUrl}
                  onChange={(url) =>
                    setProviderForm((prev) => (prev ? { ...prev, logoUrl: url } : prev))
                  }
                  folder="fortiva/provider"
                  aspect="square"
                />
              </div>
            </div>

            <footer className="flex justify-end gap-2 border-t border-[#EFEDE7] px-5 py-4">
              <button type="button" onClick={() => setProviderForm(null)} className={btnSecondary}>
                Batal
              </button>
              <button type="button" disabled={isPending} onClick={submitProvider} className={btnPrimary}>
                {isPending ? 'Menyimpan…' : 'Simpan Provider'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
