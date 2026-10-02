'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteOrder, updateOrderDetails, updateOrderStatus } from '@/app/admin/(dashboard)/actions';
import {
  EmptyState,
  StatusBadge,
  btnDanger,
  btnPrimary,
  btnSecondary,
  inputClass,
  labelClass,
} from '@/components/admin/ui';
import { IconClose, IconReceipt } from './icons';
import { formatDateTime, formatRupiah } from '@/lib/format';

export interface OrderRow {
  id: string;
  invoice_number: string;
  category_name: string;
  provider_name: string;
  nominal_label: string;
  destination: string;
  total_price: number | string;
  admin_fee: number | string;
  status: string;
  serial_number: string | null;
  token_pln: string | null;
  customer_note: string | null;
  created_at: string;
}

const STATUS_FILTERS = ['ALL', 'PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const STATUS_OPTIONS = ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'] as const;

export function OrdersClient({ initialOrders }: { initialOrders: OrderRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<OrderRow | null>(null);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const counts = useMemo(() => {
    const map: Record<string, number> = { ALL: initialOrders.length };
    for (const order of initialOrders) {
      map[order.status] = (map[order.status] ?? 0) + 1;
    }
    return map;
  }, [initialOrders]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return initialOrders.filter((order) => {
      if (filter !== 'ALL' && order.status !== filter) return false;
      if (!needle) return true;
      return (
        order.invoice_number.toLowerCase().includes(needle) ||
        order.destination.toLowerCase().includes(needle) ||
        order.provider_name.toLowerCase().includes(needle) ||
        order.category_name.toLowerCase().includes(needle)
      );
    });
  }, [initialOrders, filter, query]);

  const run = (task: () => Promise<{ ok: boolean; error?: string }>, okText: string) => {
    startTransition(async () => {
      const result = await task();
      setMessage(
        result.ok ? { tone: 'ok', text: okText } : { tone: 'error', text: result.error ?? 'Gagal.' }
      );
      if (result.ok) router.refresh();
    });
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition ${
              filter === status
                ? 'bg-[#111827] text-white'
                : 'border border-[#E5E3DC] bg-white text-[#374151] hover:border-[#111827]/25'
            }`}
          >
            {status === 'ALL' ? 'Semua' : status}
            <span className="ml-1.5 opacity-60">{counts[status] ?? 0}</span>
          </button>
        ))}

        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari invoice / nomor tujuan…"
          className={`${inputClass} ml-auto w-full sm:max-w-xs`}
        />
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
          icon={<IconReceipt className="h-5 w-5" />}
          title="Tidak ada pesanan"
          description="Belum ada pesanan yang cocok dengan filter ini."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#E5E3DC] bg-white shadow-sm">
          <table className="w-full min-w-[880px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#EFEDE7] text-[10px] uppercase tracking-[0.06em] text-[#6B7280]">
                <th className="px-5 py-3 font-bold">Invoice</th>
                <th className="px-5 py-3 font-bold">Layanan</th>
                <th className="px-5 py-3 font-bold">Tujuan</th>
                <th className="px-5 py-3 text-right font-bold">Total</th>
                <th className="px-5 py-3 font-bold">Status</th>
                <th className="px-5 py-3 font-bold">Ubah Status</th>
                <th className="px-5 py-3 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((order) => (
                <tr key={order.id} className="border-b border-[#F5F4F0] last:border-0 hover:bg-[#F7F6F2]">
                  <td className="px-5 py-3">
                    <p className="font-mono text-[11px] font-semibold text-[#111827]">
                      {order.invoice_number}
                    </p>
                    <p className="text-[10px] text-[#6B7280]">{formatDateTime(order.created_at)}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-[12px] font-semibold text-[#111827]">
                      {order.provider_name || order.category_name}
                    </p>
                    <p className="text-[11px] text-[#6B7280]">
                      {order.category_name} · {order.nominal_label}
                    </p>
                  </td>
                  <td className="px-5 py-3 font-mono text-[11px] text-[#111827]">
                    {order.destination}
                  </td>
                  <td className="num-tabular px-5 py-3 text-right text-[12px] font-semibold text-[#111827]">
                    {formatRupiah(order.total_price)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={order.status}
                      disabled={isPending}
                      onChange={(event) =>
                        run(
                          () =>
                            updateOrderStatus(
                              order.id,
                              event.target.value as (typeof STATUS_OPTIONS)[number]
                            ),
                          `Status ${order.invoice_number} diperbarui.`
                        )
                      }
                      className={`${inputClass} w-36 py-1.5 text-[12px]`}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(order)}
                        className={btnSecondary + ' !px-3 !py-1.5 !text-[11px]'}
                      >
                        Detail
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                          if (!confirm(`Hapus pesanan ${order.invoice_number}?`)) return;
                          run(() => deleteOrder(order.id), 'Pesanan dihapus.');
                        }}
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

      {editing && (
        <OrderDetailModal
          order={editing}
          isPending={isPending}
          onClose={() => setEditing(null)}
          onSave={(details) => {
            run(
              () => updateOrderDetails(editing.id, details),
              `Detail ${editing.invoice_number} disimpan.`
            );
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

function OrderDetailModal({
  order,
  isPending,
  onClose,
  onSave,
}: {
  order: OrderRow;
  isPending: boolean;
  onClose: () => void;
  onSave: (details: { serialNumber: string; tokenPln: string; customerNote: string }) => void;
}) {
  const [serialNumber, setSerialNumber] = useState(order.serial_number ?? '');
  const [tokenPln, setTokenPln] = useState(order.token_pln ?? '');
  const [customerNote, setCustomerNote] = useState(order.customer_note ?? '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
      <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl border border-[#E5E3DC] bg-white shadow-xl">
        <header className="flex items-start justify-between gap-3 border-b border-[#EFEDE7] px-5 py-4">
          <div>
            <h2 className="text-[15px] font-bold text-[#111827]">Detail Pesanan</h2>
            <p className="mt-0.5 font-mono text-[11px] text-[#6B7280]">{order.invoice_number}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-[#F7F6F2] hover:text-[#111827]"
            aria-label="Tutup"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </header>

        <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2">
          <ReadOnly label="Layanan" value={`${order.category_name} · ${order.provider_name}`} />
          <ReadOnly label="Nominal" value={order.nominal_label} />
          <ReadOnly label="Nomor Tujuan" value={order.destination} mono />
          <ReadOnly label="Total" value={formatRupiah(order.total_price)} />
        </div>

        <div className="flex flex-col gap-4 border-t border-[#EFEDE7] px-5 py-5">
          <div>
            <label htmlFor="serial" className={labelClass}>
              Serial Number
            </label>
            <input
              id="serial"
              value={serialNumber}
              onChange={(event) => setSerialNumber(event.target.value)}
              placeholder="mis. 202505241024558912"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="token" className={labelClass}>
              Token PLN <span className="text-[11px] font-normal text-[#6B7280]">(khusus token listrik)</span>
            </label>
            <input
              id="token"
              value={tokenPln}
              onChange={(event) => setTokenPln(event.target.value)}
              placeholder="mis. 4129-8812-3049-1182-9014"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="note" className={labelClass}>
              Catatan untuk Pembeli
            </label>
            <textarea
              id="note"
              rows={3}
              value={customerNote}
              onChange={(event) => setCustomerNote(event.target.value)}
              placeholder="Tampil di halaman Cek Pesanan pembeli."
              className={inputClass}
            />
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-[#EFEDE7] px-5 py-4">
          <button type="button" onClick={onClose} className={btnSecondary}>
            Batal
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => onSave({ serialNumber, tokenPln, customerNote })}
            className={btnPrimary}
          >
            Simpan
          </button>
        </footer>
      </div>
    </div>
  );
}

function ReadOnly({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#6B7280]">{label}</p>
      <p className={`mt-1 text-[13px] font-semibold text-[#111827] ${mono ? 'font-mono' : ''}`}>
        {value || '—'}
      </p>
    </div>
  );
}
