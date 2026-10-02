'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  deleteBankAccount,
  saveBankAccount,
  saveSettings,
  type BankAccountInput,
} from '@/app/admin/(dashboard)/actions';
import { ImageUploader } from './ImageUploader';
import { Badge, EmptyState, btnDanger, btnPrimary, btnSecondary, inputClass, labelClass } from './ui';
import { IconBank, IconClose } from './icons';
import { cldUrl } from '@/lib/cloudinary-url';

export interface SettingRow {
  key: string;
  value: string;
  label: string;
  group_name: string;
  sort_order: number;
}

export interface BankAccountRow {
  id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  logo_url: string | null;
  sort_order: number;
  is_active: boolean;
}

interface BankForm {
  id?: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  logoUrl: string;
  sortOrder: string;
  isActive: boolean;
}

const GROUP_TITLES: Record<string, string> = {
  umum: 'Identitas & Hero',
  kontak: 'Kontak & Dukungan',
  pembayaran: 'Pembayaran QRIS',
};

const MULTILINE_KEYS = new Set(['hero_subtitle', 'payment_instructions']);

export function SettingsClient({
  initialSettings,
  initialBankAccounts,
}: {
  initialSettings: SettingRow[];
  initialBankAccounts: BankAccountRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialSettings.map((item) => [item.key, item.value]))
  );
  const [bankForm, setBankForm] = useState<BankForm | null>(null);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, SettingRow[]>();
    for (const item of initialSettings) {
      const list = map.get(item.group_name) ?? [];
      list.push(item);
      map.set(item.group_name, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.sort_order - b.sort_order);
    }
    return [...map.entries()];
  }, [initialSettings]);

  const notify = (result: { ok: boolean; error?: string }, okText: string) => {
    setMessage(
      result.ok ? { tone: 'ok', text: okText } : { tone: 'error', text: result.error ?? 'Gagal.' }
    );
    if (result.ok) router.refresh();
  };

  const submitSettings = () => {
    startTransition(async () => {
      notify(await saveSettings(values), 'Pengaturan disimpan.');
    });
  };

  const submitBank = () => {
    if (!bankForm) return;
    const payload: BankAccountInput = {
      id: bankForm.id,
      bankName: bankForm.bankName,
      accountNumber: bankForm.accountNumber,
      accountName: bankForm.accountName,
      logoUrl: bankForm.logoUrl,
      sortOrder: Number(bankForm.sortOrder) || 0,
      isActive: bankForm.isActive,
    };

    startTransition(async () => {
      const result = await saveBankAccount(payload);
      notify(result, bankForm.id ? 'Rekening diperbarui.' : 'Rekening ditambahkan.');
      if (result.ok) setBankForm(null);
    });
  };

  return (
    <>
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {groups.map(([groupName, items]) => (
          <section
            key={groupName}
            className="rounded-2xl border border-[#E5E3DC] bg-white shadow-sm"
          >
            <header className="border-b border-[#EFEDE7] px-5 py-4">
              <h2 className="text-[15px] font-bold text-[#111827]">
                {GROUP_TITLES[groupName] ?? groupName}
              </h2>
            </header>

            <div className="flex flex-col gap-4 px-5 py-5">
              {items.map((item) => {
                if (item.key === 'qris_image_url') {
                  return (
                    <ImageUploader
                      key={item.key}
                      label={item.label || 'Gambar QRIS'}
                      hint="JPG, PNG, atau WEBP · maksimal 10MB"
                      value={values[item.key] ?? ''}
                      onChange={(url) => setValues((prev) => ({ ...prev, [item.key]: url }))}
                      folder="fortiva/qris"
                      aspect="square"
                    />
                  );
                }

                const isMultiline = MULTILINE_KEYS.has(item.key);

                return (
                  <div key={item.key}>
                    <label htmlFor={`setting-${item.key}`} className={labelClass}>
                      {item.label || item.key}
                      <span className="ml-2 font-mono text-[10px] font-normal text-[#9CA3AF]">
                        {item.key}
                      </span>
                    </label>
                    {isMultiline ? (
                      <textarea
                        id={`setting-${item.key}`}
                        rows={3}
                        value={values[item.key] ?? ''}
                        onChange={(event) =>
                          setValues((prev) => ({ ...prev, [item.key]: event.target.value }))
                        }
                        className={inputClass}
                      />
                    ) : (
                      <input
                        id={`setting-${item.key}`}
                        value={values[item.key] ?? ''}
                        onChange={(event) =>
                          setValues((prev) => ({ ...prev, [item.key]: event.target.value }))
                        }
                        className={inputClass}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <button type="button" disabled={isPending} onClick={submitSettings} className={btnPrimary}>
          {isPending ? 'Menyimpan…' : 'Simpan Semua Pengaturan'}
        </button>
      </div>

      {/* ------------------ Rekening Bank ------------------ */}
      <section className="mt-8 rounded-2xl border border-[#E5E3DC] bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFEDE7] px-5 py-4">
          <div>
            <h2 className="text-[15px] font-bold text-[#111827]">Rekening Bank</h2>
            <p className="mt-0.5 text-[12px] text-[#6B7280]">
              Ditampilkan sebagai alternatif pembayaran transfer.
            </p>
          </div>
          <button
            type="button"
            className={btnPrimary}
            onClick={() =>
              setBankForm({
                bankName: '',
                accountNumber: '',
                accountName: '',
                logoUrl: '',
                sortOrder: String(initialBankAccounts.length + 1),
                isActive: true,
              })
            }
          >
            + Tambah Rekening
          </button>
        </header>

        <div className="px-5 py-5">
          {initialBankAccounts.length === 0 ? (
            <EmptyState icon={<IconBank className="h-5 w-5" />} title="Belum ada rekening" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#EFEDE7] text-[10px] uppercase tracking-[0.06em] text-[#6B7280]">
                    <th className="px-3 py-3 font-bold">Bank</th>
                    <th className="px-3 py-3 font-bold">Nomor Rekening</th>
                    <th className="px-3 py-3 font-bold">Atas Nama</th>
                    <th className="px-3 py-3 font-bold">Status</th>
                    <th className="px-3 py-3 text-right font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {initialBankAccounts.map((account) => (
                    <tr key={account.id} className="border-b border-[#F5F4F0] last:border-0 hover:bg-[#F7F6F2]">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          {account.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cldUrl(account.logo_url, { w: 60, h: 60 })}
                              alt={account.bank_name}
                              loading="lazy"
                              className="h-7 w-7 rounded-md object-contain"
                            />
                          ) : (
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F7F6F2] text-[#6B7280]">
                              <IconBank className="h-3.5 w-3.5" />
                            </span>
                          )}
                          <span className="text-[12px] font-semibold text-[#111827]">
                            {account.bank_name}
                          </span>
                        </div>
                      </td>
                      <td className="num-tabular px-3 py-3 font-mono text-[12px] text-[#111827]">
                        {account.account_number}
                      </td>
                      <td className="px-3 py-3 text-[12px] text-[#374151]">{account.account_name}</td>
                      <td className="px-3 py-3">
                        {account.is_active ? <Badge tone="green">Aktif</Badge> : <Badge tone="gray">Nonaktif</Badge>}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className={`${btnSecondary} !px-3 !py-1.5 !text-[11px]`}
                            onClick={() =>
                              setBankForm({
                                id: account.id,
                                bankName: account.bank_name,
                                accountNumber: account.account_number,
                                accountName: account.account_name,
                                logoUrl: account.logo_url ?? '',
                                sortOrder: String(account.sort_order),
                                isActive: account.is_active,
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
                              if (!confirm(`Hapus rekening ${account.bank_name}?`)) return;
                              startTransition(async () => {
                                notify(await deleteBankAccount(account.id), 'Rekening dihapus.');
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
        </div>
      </section>

      {bankForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
          <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl border border-[#E5E3DC] bg-white shadow-xl">
            <header className="flex items-start justify-between gap-3 border-b border-[#EFEDE7] px-5 py-4">
              <h2 className="text-[15px] font-bold text-[#111827]">
                {bankForm.id ? 'Ubah Rekening' : 'Tambah Rekening'}
              </h2>
              <button
                type="button"
                onClick={() => setBankForm(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-[#F7F6F2] hover:text-[#111827]"
                aria-label="Tutup"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </header>

            <div className="grid grid-cols-1 gap-4 px-5 py-5">
              <div>
                <label htmlFor="bank-name" className={labelClass}>
                  Nama Bank
                </label>
                <input
                  id="bank-name"
                  value={bankForm.bankName}
                  onChange={(event) => setBankForm({ ...bankForm, bankName: event.target.value })}
                  placeholder="BCA"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="bank-number" className={labelClass}>
                  Nomor Rekening
                </label>
                <input
                  id="bank-number"
                  value={bankForm.accountNumber}
                  onChange={(event) =>
                    setBankForm({ ...bankForm, accountNumber: event.target.value })
                  }
                  placeholder="1234567890"
                  className={`${inputClass} num-tabular font-mono`}
                />
              </div>

              <div>
                <label htmlFor="bank-owner" className={labelClass}>
                  Atas Nama
                </label>
                <input
                  id="bank-owner"
                  value={bankForm.accountName}
                  onChange={(event) => setBankForm({ ...bankForm, accountName: event.target.value })}
                  placeholder="PT Fortiva Digital Nusantara"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="bank-order" className={labelClass}>
                  Urutan
                </label>
                <input
                  id="bank-order"
                  type="number"
                  value={bankForm.sortOrder}
                  onChange={(event) => setBankForm({ ...bankForm, sortOrder: event.target.value })}
                  className={`${inputClass} num-tabular`}
                />
              </div>

              <ImageUploader
                label="Logo Bank"
                value={bankForm.logoUrl}
                onChange={(url) => setBankForm((prev) => (prev ? { ...prev, logoUrl: url } : prev))}
                folder="fortiva/bank"
                aspect="square"
              />

              <label className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={bankForm.isActive}
                  onChange={(event) => setBankForm({ ...bankForm, isActive: event.target.checked })}
                  className="h-4 w-4 rounded border-[#E5E3DC] accent-[#F2352B]"
                />
                <span className="text-[13px] font-semibold text-[#111827]">
                  Tampilkan di halaman toko
                </span>
              </label>
            </div>

            <footer className="flex justify-end gap-2 border-t border-[#EFEDE7] px-5 py-4">
              <button type="button" onClick={() => setBankForm(null)} className={btnSecondary}>
                Batal
              </button>
              <button type="button" disabled={isPending} onClick={submitBank} className={btnPrimary}>
                {isPending ? 'Menyimpan…' : 'Simpan Rekening'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
