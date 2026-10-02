'use client';

import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  completeOrder,
  deleteOrder,
  processOrder,
  rejectPayment,
  updateOrderDetails,
  updateOrderStatus,
  verifyPayment,
} from '@/app/admin/(dashboard)/actions';
import {
  ORDER_STATUSES,
  STATUS_LABELS,
  TIMELINE_STEPS,
  normalizeOrderStatus,
  timelineIndex,
  type OrderStatus,
} from '@/lib/order-status';
import {
  EmptyState,
  StatusBadge,
  btnPrimary,
  btnSecondary,
  inputClass,
  labelClass,
} from '@/components/admin/ui';
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconCopy,
  IconFilter,
  IconMoreVertical,
  IconReceipt,
  IconRefresh,
  IconSearch,
  IconTrash,
} from './icons';
import { formatNumber, formatRupiah } from '@/lib/format';

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
  payment_method: string | null;
  created_at: string;
}

/* ------------------------------------------------------------------ *
 * Queue tabs — 4 antrean kerja, bukan 7 status mentah
 * ------------------------------------------------------------------ */
type QueueKey = 'ALL' | 'ACTION' | 'PROCESSING' | 'DONE';

const QUEUES: { key: QueueKey; label: string; statuses: OrderStatus[] | null }[] = [
  { key: 'ALL', label: 'Semua', statuses: null },
  {
    key: 'ACTION',
    label: 'Perlu Tindakan',
    statuses: ['PENDING_PAYMENT', 'WAITING_VERIFICATION', 'VERIFIED'],
  },
  { key: 'PROCESSING', label: 'Diproses', statuses: ['PROCESSING'] },
  { key: 'DONE', label: 'Selesai', statuses: ['SUCCESS'] },
];

type RangeKey = 'ALL' | 'TODAY' | '7D' | '30D';
const RANGES: { key: RangeKey; label: string; days: number | null }[] = [
  { key: 'ALL', label: 'Semua tanggal', days: null },
  { key: 'TODAY', label: 'Hari ini', days: 0 },
  { key: '7D', label: '7 hari terakhir', days: 7 },
  { key: '30D', label: '30 hari terakhir', days: 30 },
];

type SortKey = 'newest' | 'oldest' | 'highest';
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Terbaru' },
  { key: 'oldest', label: 'Terlama' },
  { key: 'highest', label: 'Total terbesar' },
];

const PAGE_SIZE = 20;

/* ------------------------------------------------------------------ *
 * Helper tampilan
 * ------------------------------------------------------------------ */
const JAKARTA = 'Asia/Jakarta';

function orderDate(value: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: JAKARTA,
  }).format(date);
}

function orderTime(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: JAKARTA,
  })
    .format(date)
    .replace('.', ':');
}

function isWithinRange(createdAt: string, range: RangeKey): boolean {
  if (range === 'ALL') return true;
  const days = RANGES.find((item) => item.key === range)?.days ?? null;
  if (days === null) return true;

  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return true;

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();

  if (days === 0) return created >= startOfToday;
  return created >= startOfToday - (days - 1) * 24 * 60 * 60 * 1000;
}

function pageWindow(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const wanted = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...wanted].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);

  const output: (number | '…')[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) output.push('…');
    output.push(page);
    previous = page;
  }
  return output;
}

/** Tombol aksi yang relevan dengan status saat ini (alur normal). */
function nextAction(status: OrderStatus):
  | { label: string; run: (id: string) => Promise<{ ok: boolean; error?: string }>; tone: string }
  | undefined {
  switch (status) {
    case 'PENDING_PAYMENT':
    case 'WAITING_VERIFICATION':
      return { label: 'Verifikasi Pembayaran', run: verifyPayment, tone: 'bg-[#245BE8] hover:bg-[#1D49BB] text-white' };
    case 'VERIFIED':
      return { label: 'Proses Pesanan', run: processOrder, tone: 'bg-[#111827] hover:bg-[#374151] text-white' };
    case 'PROCESSING':
      return { label: 'Tandai Selesai', run: completeOrder, tone: 'bg-[#16803C] hover:bg-emerald-700 text-white' };
    default:
      return undefined;
  }
}

/* ------------------------------------------------------------------ *
 * Halaman
 * ------------------------------------------------------------------ */
export function OrdersClient({ initialOrders }: { initialOrders: OrderRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [queue, setQueue] = useState<QueueKey>('ALL');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'ALL' | OrderStatus>('ALL');
  const [range, setRange] = useState<RangeKey>('ALL');
  const [category, setCategory] = useState('ALL');
  const [sort, setSort] = useState<SortKey>('newest');

  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const order of initialOrders) if (order.category_name) set.add(order.category_name);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [initialOrders]);

  const queueCounts = useMemo(() => {
    const map: Record<QueueKey, number> = { ALL: 0, ACTION: 0, PROCESSING: 0, DONE: 0 };
    for (const order of initialOrders) {
      const value = normalizeOrderStatus(order.status);
      map.ALL += 1;
      for (const item of QUEUES) {
        if (item.statuses?.includes(value)) map[item.key] += 1;
      }
    }
    return map;
  }, [initialOrders]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const activeQueue = QUEUES.find((item) => item.key === queue);

    const rows = initialOrders.filter((order) => {
      const value = normalizeOrderStatus(order.status);

      if (activeQueue?.statuses && !activeQueue.statuses.includes(value)) return false;
      if (status !== 'ALL' && value !== status) return false;
      if (category !== 'ALL' && order.category_name !== category) return false;
      if (!isWithinRange(order.created_at, range)) return false;

      if (!needle) return true;
      return (
        order.invoice_number.toLowerCase().includes(needle) ||
        order.destination.toLowerCase().includes(needle) ||
        order.provider_name.toLowerCase().includes(needle) ||
        order.category_name.toLowerCase().includes(needle) ||
        order.nominal_label.toLowerCase().includes(needle)
      );
    });

    return [...rows].sort((a, b) => {
      if (sort === 'highest') return Number(b.total_price) - Number(a.total_price);
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0;
      return sort === 'oldest' ? aTime - bTime : bTime - aTime;
    });
  }, [initialOrders, queue, status, category, range, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const firstRow = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const lastRow = Math.min(safePage * PAGE_SIZE, filtered.length);

  const activeFilterCount =
    (queue !== 'ALL' ? 1 : 0) +
    (status !== 'ALL' ? 1 : 0) +
    (range !== 'ALL' ? 1 : 0) +
    (category !== 'ALL' ? 1 : 0) +
    (sort !== 'newest' ? 1 : 0) +
    (query.trim() ? 1 : 0);

  // Filter berubah -> kembali ke halaman pertama.
  useEffect(() => {
    setPage(1);
  }, [queue, status, range, category, sort, query]);

  const editing = useMemo(
    () => initialOrders.find((order) => order.id === editingId) ?? null,
    [initialOrders, editingId]
  );

  const run = (
    task: () => Promise<{ ok: boolean; error?: string }>,
    okText: string,
    after?: () => void
  ) => {
    startTransition(async () => {
      const result = await task();
      setNotice(
        result.ok ? { tone: 'ok', text: okText } : { tone: 'error', text: result.error ?? 'Gagal.' }
      );
      if (result.ok) {
        router.refresh();
        after?.();
      }
    });
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => setNotice({ tone: 'ok', text: `${label} disalin.` }),
      () => setNotice({ tone: 'error', text: 'Tidak bisa menyalin ke clipboard.' })
    );
    setMenuFor(null);
  };

  const resetFilters = () => {
    setQueue('ALL');
    setStatus('ALL');
    setRange('ALL');
    setCategory('ALL');
    setSort('newest');
    setQuery('');
  };

  return (
    <>
      {/* ---------- Queue tabs ---------- */}
      <div className="mb-3 grid grid-cols-2 gap-1.5 rounded-2xl border border-[#E5E3DC] bg-white p-1.5 sm:grid-cols-4">
        {QUEUES.map((item) => {
          const active = queue === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setQueue(item.key)}
              className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-[12px] font-semibold transition ${
                active
                  ? 'bg-[#111827] text-white'
                  : 'text-[#374151] hover:bg-[#F7F6F2]'
              }`}
            >
              {item.label}
              <span
                className={`num-tabular rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
                  active ? 'bg-white/15 text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
                }`}
              >
                {formatNumber(queueCounts[item.key])}
              </span>
            </button>
          );
        })}
      </div>

      {/* ---------- Toolbar ---------- */}
      <div className="mb-4 rounded-2xl border border-[#E5E3DC] bg-white p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari invoice / nomor tujuan..."
              aria-label="Cari invoice atau nomor tujuan"
              className={`${inputClass} pl-9`}
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as 'ALL' | OrderStatus)}
            aria-label="Filter status"
            className={`${inputClass} sm:w-[190px]`}
          >
            <option value="ALL">Semua status</option>
            {ORDER_STATUSES.map((item) => (
              <option key={item} value={item}>
                {STATUS_LABELS[item]}
              </option>
            ))}
          </select>

          <select
            value={range}
            onChange={(event) => setRange(event.target.value as RangeKey)}
            aria-label="Filter tanggal"
            className={`${inputClass} sm:w-[170px]`}
          >
            {RANGES.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            aria-expanded={showFilters}
            className={`${btnSecondary} shrink-0 ${showFilters ? 'border-[#111827]/30 bg-[#F7F6F2]' : ''}`}
          >
            <IconFilter className="h-4 w-4" />
            Filter
          </button>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className={`${btnSecondary} shrink-0 text-[#F2352B]`}
            >
              <IconRefresh className="h-4 w-4" />
              Reset
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-3 flex flex-col gap-2 border-t border-[#EFEDE7] pt-3 sm:flex-row sm:items-center">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Filter layanan"
              className={`${inputClass} sm:w-[220px]`}
            >
              <option value="ALL">Semua layanan</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              aria-label="Urutkan"
              className={`${inputClass} sm:w-[190px]`}
            >
              {SORTS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>

            <p className="text-[11px] text-[#6B7280] sm:ml-auto">
              Filter tetap aktif saat kamu membuka detail pesanan.
            </p>
          </div>
        )}
      </div>

      {/* ---------- Notifikasi ---------- */}
      {notice && (
        <div
          role="status"
          className={`mb-3 flex items-start justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-[12px] font-medium ${
            notice.tone === 'ok'
              ? 'border-[#16803C]/25 bg-[#16803C]/5 text-[#16803C]'
              : 'border-[#F2352B]/25 bg-[#F2352B]/5 text-[#F2352B]'
          }`}
        >
          <span>{notice.text}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Tutup notifikasi"
            className="shrink-0 opacity-70 transition hover:opacity-100"
          >
            <IconClose className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ---------- Daftar pesanan ---------- */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<IconReceipt className="h-5 w-5" />}
          title="Tidak ada pesanan"
          description={
            activeFilterCount > 0
              ? 'Tidak ada pesanan yang cocok dengan filter aktif. Coba reset filter.'
              : 'Pesanan dari halaman checkout akan muncul di sini.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E5E3DC] bg-white">
          {/* Desktop: tabel padat */}
          <div className="hidden lg:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#EFEDE7] bg-[#FBFAF7] text-[10px] font-bold uppercase tracking-[0.06em] text-[#6B7280]">
                  <th className="px-5 py-3">Invoice</th>
                  <th className="px-5 py-3">Layanan</th>
                  <th className="px-5 py-3">Tujuan</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#F5F4F0] transition-colors last:border-0 hover:bg-[#FBFAF7]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-mono text-[13px] font-bold tracking-tight text-[#111827]">
                        {order.invoice_number}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#9CA3AF]">
                        {orderDate(order.created_at)}, {orderTime(order.created_at)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[13px] font-semibold text-[#111827]">
                        {order.provider_name || '—'}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#6B7280]">
                        {order.category_name} · {order.nominal_label}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-mono text-[12px] text-[#374151]">
                      {order.destination}
                    </td>
                    <td className="num-tabular px-5 py-4 text-right text-[13px] font-semibold text-[#111827]">
                      {formatRupiah(order.total_price)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingId(order.id)}
                          className="rounded-lg border border-[#E5E3DC] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#111827] transition hover:border-[#111827]/25 hover:bg-[#F7F6F2]"
                        >
                          Detail
                        </button>
                        <RowMenu
                          order={order}
                          open={menuFor === order.id}
                          onToggle={() => setMenuFor(menuFor === order.id ? null : order.id)}
                          onClose={() => setMenuFor(null)}
                          onDetail={() => {
                            setEditingId(order.id);
                            setMenuFor(null);
                          }}
                          onCopy={(label) => {
                            const map: Record<string, string> = {
                              invoice: order.invoice_number,
                              tujuan: order.destination,
                            };
                            copy(map[label] ?? '', label === 'invoice' ? 'Invoice' : 'Nomor tujuan');
                          }}
                          onDelete={() => {
                            setMenuFor(null);
                            if (!confirm(`Hapus pesanan ${order.invoice_number}? Tindakan ini permanen.`))
                              return;
                            run(() => deleteOrder(order.id), `Pesanan ${order.invoice_number} dihapus.`);
                          }}
                          isPending={isPending}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet: baris daftar ringkas */}
          <ul className="divide-y divide-[#F5F4F0] lg:hidden">
            {paged.map((order) => (
              <li key={order.id} className="px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[13px] font-bold text-[#111827]">
                      {order.invoice_number}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#9CA3AF]">
                      {orderDate(order.created_at)}, {orderTime(order.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="mt-2.5 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-[#111827]">
                      {order.provider_name || '—'}
                    </p>
                    <p className="truncate text-[11px] text-[#6B7280]">
                      {order.category_name} · {order.nominal_label}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-[#374151]">{order.destination}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="num-tabular text-[13px] font-bold text-[#111827]">
                      {formatRupiah(order.total_price)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setEditingId(order.id)}
                      className="mt-2 h-9 rounded-lg border border-[#E5E3DC] bg-white px-3 text-[11px] font-semibold text-[#111827]"
                    >
                      Detail
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* ---------- Footer tabel + pagination ---------- */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-[#EFEDE7] px-5 py-3 sm:flex-row">
            <p className="num-tabular text-[11px] text-[#6B7280]">
              Menampilkan {formatNumber(firstRow)}–{formatNumber(lastRow)} dari{' '}
              {formatNumber(filtered.length)} pesanan
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, safePage - 1))}
                disabled={safePage <= 1}
                aria-label="Halaman sebelumnya"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E3DC] bg-white text-[#374151] transition hover:bg-[#F7F6F2] disabled:opacity-40"
              >
                <IconChevronLeft className="h-4 w-4" />
              </button>

              {pageWindow(safePage, totalPages).map((item, index) =>
                item === '…' ? (
                  <span
                    key={`gap-${index}`}
                    className="flex h-9 w-7 items-center justify-center text-[12px] text-[#9CA3AF]"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPage(item)}
                    aria-current={item === safePage ? 'page' : undefined}
                    className={`num-tabular flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-[12px] font-semibold transition ${
                      item === safePage
                        ? 'bg-[#111827] text-white'
                        : 'border border-[#E5E3DC] bg-white text-[#374151] hover:bg-[#F7F6F2]'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage >= totalPages}
                aria-label="Halaman berikutnya"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E3DC] bg-white text-[#374151] transition hover:bg-[#F7F6F2] disabled:opacity-40"
              >
                <IconChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Detail pesanan ---------- */}
      {editing && (
        <OrderDetailDrawer
          order={editing}
          isPending={isPending}
          onClose={() => setEditingId(null)}
          onRun={run}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Menu "⋮" per baris
 * ------------------------------------------------------------------ */
function RowMenu({
  order,
  open,
  onToggle,
  onClose,
  onDetail,
  onCopy,
  onDelete,
  isPending,
}: {
  order: OrderRow;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onDetail: () => void;
  onCopy: (label: 'invoice' | 'tujuan') => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-label={`Menu lain untuk ${order.invoice_number}`}
        aria-expanded={open}
        className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
          open
            ? 'border-[#111827]/25 bg-[#F7F6F2] text-[#111827]'
            : 'border-transparent text-[#6B7280] hover:bg-[#F7F6F2] hover:text-[#111827]'
        }`}
      >
        <IconMoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={onClose}
            className="fixed inset-0 z-20 cursor-default"
          />
          <div className="absolute right-0 top-9 z-30 w-52 overflow-hidden rounded-xl border border-[#E5E3DC] bg-white py-1 shadow-lg">
            <MenuItem onClick={onDetail}>
              <IconReceipt className="h-4 w-4" />
              Buka Detail
            </MenuItem>
            <MenuItem onClick={() => onCopy('invoice')}>
              <IconCopy className="h-4 w-4" />
              Salin Nomor Invoice
            </MenuItem>
            <MenuItem onClick={() => onCopy('tujuan')}>
              <IconCopy className="h-4 w-4" />
              Salin Nomor Tujuan
            </MenuItem>
            <div className="my-1 border-t border-[#EFEDE7]" />
            <MenuItem onClick={onDelete} disabled={isPending} danger>
              <IconTrash className="h-4 w-4" />
              Hapus Pesanan
            </MenuItem>
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({
  children,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[12px] font-medium transition disabled:opacity-50 ${
        danger ? 'text-[#F2352B] hover:bg-[#F2352B]/8' : 'text-[#374151] hover:bg-[#F7F6F2]'
      }`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * Drawer detail pesanan
 * ------------------------------------------------------------------ */
function OrderDetailDrawer({
  order,
  isPending,
  onClose,
  onRun,
}: {
  order: OrderRow;
  isPending: boolean;
  onClose: () => void;
  onRun: (
    task: () => Promise<{ ok: boolean; error?: string }>,
    okText: string,
    after?: () => void
  ) => void;
}) {
  const status = normalizeOrderStatus(order.status);
  const [statusDraft, setStatusDraft] = useState<OrderStatus>(status);
  const [serialNumber, setSerialNumber] = useState(order.serial_number ?? '');
  const [tokenPln, setTokenPln] = useState(order.token_pln ?? '');
  const [customerNote, setCustomerNote] = useState(order.customer_note ?? '');
  const [drawerNotice, setDrawerNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(
    null
  );

  // Ikuti data terbaru setelah server refresh (mis. status berubah).
  useEffect(() => {
    setStatusDraft(status);
    setSerialNumber(order.serial_number ?? '');
    setTokenPln(order.token_pln ?? '');
    setCustomerNote(order.customer_note ?? '');
  }, [order.id, order.status, order.serial_number, order.token_pln, order.customer_note, status]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const action = nextAction(status);
  const current = timelineIndex(status);
  const failed = status === 'FAILED' || status === 'EXPIRED';
  const canReject = status !== 'SUCCESS' && status !== 'FAILED' && status !== 'EXPIRED';

  const runInDrawer = (
    task: () => Promise<{ ok: boolean; error?: string }>,
    okText: string
  ) =>
    onRun(task, okText, () => {
      setDrawerNotice({ tone: 'ok', text: okText });
    });

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Tutup detail"
        onClick={onClose}
        className="absolute inset-0 bg-[#111827]/50 backdrop-blur-[2px]"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Detail pesanan ${order.invoice_number}`}
        className="relative flex h-full w-full max-w-full flex-col bg-[#F7F6F2] shadow-2xl sm:max-w-[560px]"
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-3 border-b border-[#E5E3DC] bg-white px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
              Detail Pesanan
            </p>
            <h2 className="mt-0.5 truncate font-mono text-[16px] font-bold text-[#111827]">
              {order.invoice_number}
            </h2>
            <p className="mt-0.5 text-[11px] text-[#9CA3AF]">
              {orderDate(order.created_at)}, {orderTime(order.created_at)} WIB
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-[#F7F6F2] hover:text-[#111827]"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {drawerNotice && (
            <p
              className={`mb-4 rounded-xl border px-3.5 py-2.5 text-[12px] font-medium ${
                drawerNotice.tone === 'ok'
                  ? 'border-[#16803C]/25 bg-[#16803C]/5 text-[#16803C]'
                  : 'border-[#F2352B]/25 bg-[#F2352B]/5 text-[#F2352B]'
              }`}
            >
              {drawerNotice.text}
            </p>
          )}

          {/* Status + aksi relevan */}
          <section className="rounded-2xl border border-[#E5E3DC] bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[13px] font-bold text-[#111827]">Status Transaksi</h3>
              <StatusBadge status={order.status} />
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={statusDraft}
                onChange={(event) => setStatusDraft(normalizeOrderStatus(event.target.value))}
                aria-label="Pilih status transaksi"
                className={`${inputClass} sm:flex-1`}
              >
                {ORDER_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {STATUS_LABELS[item]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={isPending || statusDraft === status}
                onClick={() =>
                  runInDrawer(
                    () => updateOrderStatus(order.id, statusDraft),
                    `Status ${order.invoice_number} diperbarui.`
                  )
                }
                className={`${btnPrimary} shrink-0`}
              >
                Simpan Perubahan
              </button>
            </div>

            {(action || canReject) && (
              <div className="mt-4 border-t border-[#EFEDE7] pt-4">
                <p className="mb-2 text-[11px] font-semibold text-[#6B7280]">
                  Tindakan sesuai alur status
                </p>
                <div className="flex flex-wrap gap-2">
                  {action && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        runInDrawer(() => action.run(order.id), `${action.label} berhasil.`)
                      }
                      className={`rounded-xl px-4 py-2.5 text-[12px] font-semibold transition disabled:opacity-60 ${action.tone}`}
                    >
                      {action.label}
                    </button>
                  )}
                  {canReject && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        if (
                          !confirm(
                            `Tolak pembayaran ${order.invoice_number}? Status menjadi "Pembayaran Tidak Ditemukan".`
                          )
                        )
                          return;
                        runInDrawer(() => rejectPayment(order.id), 'Laporan pembayaran ditolak.');
                      }}
                      className="rounded-xl border border-[#F2352B]/25 bg-white px-4 py-2.5 text-[12px] font-semibold text-[#F2352B] transition hover:bg-[#F2352B] hover:text-white disabled:opacity-60"
                    >
                      Tolak Pembayaran
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Timeline */}
          <section className="mt-4 rounded-2xl border border-[#E5E3DC] bg-white p-5">
            <h3 className="mb-4 text-[13px] font-bold text-[#111827]">Timeline Transaksi</h3>
            <ol>
              {TIMELINE_STEPS.map((step, index) => {
                const done = index < current;
                const active = index === current;
                const bad = failed && index === current;
                const isLast = index === TIMELINE_STEPS.length - 1;
                return (
                  <li key={step.title} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                          done
                            ? 'bg-[#16803C] text-white'
                            : bad
                              ? 'bg-[#F2352B] text-white'
                              : active
                                ? 'bg-white ring-2 ring-[#245BE8]'
                                : 'bg-[#F3F4F6] text-[#9CA3AF]'
                        }`}
                      >
                        {done ? (
                          <IconCheck className="h-3.5 w-3.5" />
                        ) : (
                          <span>{bad ? '!' : index + 1}</span>
                        )}
                      </span>
                      {!isLast && (
                        <span
                          className={`my-1 w-0.5 flex-1 rounded-full ${
                            done ? 'bg-[#16803C]/30' : 'bg-[#E5E3DC]'
                          }`}
                        />
                      )}
                    </div>
                    <div className={isLast ? 'pb-0' : 'pb-4'}>
                      <p
                        className={`text-[12px] font-bold ${
                          done ? 'text-[#16803C]' : bad ? 'text-[#F2352B]' : 'text-[#111827]'
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#6B7280]">{step.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Rincian */}
          <section className="mt-4 rounded-2xl border border-[#E5E3DC] bg-white p-5">
            <h3 className="mb-1 text-[13px] font-bold text-[#111827]">Rincian Transaksi</h3>
            <dl>
              <DetailLine label="Invoice" value={order.invoice_number} mono />
              <DetailLine
                label="Tanggal"
                value={`${orderDate(order.created_at)}, ${orderTime(order.created_at)} WIB`}
              />
              <DetailLine label="Layanan" value={order.category_name || '—'} />
              <DetailLine label="Provider" value={order.provider_name || '—'} />
              <DetailLine label="Produk" value={order.nominal_label || '—'} />
              <DetailLine label="Tujuan" value={order.destination} mono />
              <DetailLine
                label="Harga"
                value={formatRupiah(Number(order.total_price) - Number(order.admin_fee))}
              />
              <DetailLine label="Biaya Admin" value={formatRupiah(order.admin_fee)} />
              <DetailLine label="Total" value={formatRupiah(order.total_price)} mono strong />
              <DetailLine label="Metode Pembayaran" value={order.payment_method || 'QRIS'} />
              <DetailLine label="Status" value={STATUS_LABELS[status]} />
            </dl>
          </section>

          {/* Hasil produk & catatan */}
          <section className="mt-4 rounded-2xl border border-[#E5E3DC] bg-white p-5">
            <h3 className="text-[13px] font-bold text-[#111827]">Hasil Produk &amp; Catatan</h3>
            <p className="mt-1 text-[11px] text-[#6B7280]">
              Serial number dan token hanya terlihat pembeli setelah pembayaran terverifikasi.
            </p>

            <div className="mt-4 flex flex-col gap-4">
              <div>
                <label htmlFor="detail-serial" className={labelClass}>
                  Serial Number
                </label>
                <input
                  id="detail-serial"
                  value={serialNumber}
                  onChange={(event) => setSerialNumber(event.target.value)}
                  placeholder="mis. 202505241024558912"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="detail-token" className={labelClass}>
                  Token PLN{' '}
                  <span className="text-[11px] font-normal text-[#6B7280]">
                    (khusus token listrik)
                  </span>
                </label>
                <input
                  id="detail-token"
                  value={tokenPln}
                  onChange={(event) => setTokenPln(event.target.value)}
                  placeholder="mis. 4129-8812-3049-1182-9014"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="detail-note" className={labelClass}>
                  Catatan untuk Pembeli
                </label>
                <textarea
                  id="detail-note"
                  rows={3}
                  value={customerNote}
                  onChange={(event) => setCustomerNote(event.target.value)}
                  placeholder="Tampil di halaman Cek Pesanan pembeli."
                  className={inputClass}
                />
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  runInDrawer(
                    () =>
                      updateOrderDetails(order.id, { serialNumber, tokenPln, customerNote }),
                    `Detail ${order.invoice_number} disimpan.`
                  )
                }
                className={btnPrimary}
              >
                Simpan Serial &amp; Catatan
              </button>
            </div>
          </section>

          {/* Hapus */}
          <section className="mt-4 rounded-2xl border border-[#F2352B]/20 bg-white p-5">
            <h3 className="text-[13px] font-bold text-[#111827]">Hapus Pesanan</h3>
            <p className="mt-1 text-[11px] text-[#6B7280]">
              Pesanan dihapus permanen dan tidak bisa dikembalikan.
            </p>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                if (!confirm(`Hapus pesanan ${order.invoice_number}? Tindakan ini permanen.`)) return;
                onRun(() => deleteOrder(order.id), `Pesanan ${order.invoice_number} dihapus.`, () =>
                  onClose()
                );
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#F2352B]/25 bg-white px-4 py-2.5 text-[12px] font-semibold text-[#F2352B] transition hover:bg-[#F2352B] hover:text-white disabled:opacity-60"
            >
              <IconTrash className="h-4 w-4" />
              Hapus Pesanan
            </button>
          </section>
        </div>
      </aside>
    </div>
  );
}

function DetailLine({
  label,
  value,
  mono,
  strong,
}: {
  label: string;
  value: string;
  mono?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#F5F4F0] py-2.5 last:border-0">
      <dt className="shrink-0 text-[12px] text-[#6B7280]">{label}</dt>
      <dd
        className={`text-right text-[12px] text-[#111827] ${mono ? 'num-tabular font-mono' : ''} ${
          strong ? 'text-[14px] font-bold' : 'font-semibold'
        }`}
      >
        {value || '—'}
      </dd>
    </div>
  );
}
