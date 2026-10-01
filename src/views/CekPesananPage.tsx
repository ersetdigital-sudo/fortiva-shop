'use client';

import React, { useState, useEffect } from 'react';
import { verifyOrder, VerifiedOrderDetail } from '../services/orderService';
import { Link, useRouter } from '../router';

/* ---------- Inline icons (SVG, anti-FOUT) ---------- */
type IconProps = { className?: string };

const SearchIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.6-3.6" />
  </svg>
);

const ReceiptIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12a1 1 0 0 1 1 1v16.5l-3-1.8-3 1.8-3-1.8-3 1.8V4a1 1 0 0 1 1-1Z" />
    <path d="M9 8h6M9 11.5h4" />
  </svg>
);

const PinIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21c4.2-4.2 6.5-7.4 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 13.6 7.8 16.8 12 21Z" />
    <circle cx="12" cy="10.5" r="2.4" />
  </svg>
);

const ShieldIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l7 3v5.5c0 4.4-3 8.3-7 9.5-4-1.2-7-5.1-7-9.5V6l7-3Z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const CheckIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5 L10 17.5 L19 7" />
  </svg>
);

const CopyIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H16" />
  </svg>
);

const ChatIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12a7.5 7.5 0 0 1-11 6.6L4 20l1.4-4.2A7.5 7.5 0 1 1 20 12Z" />
  </svg>
);

const AlertIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.4h.01" />
  </svg>
);

const ClockIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </svg>
);

const ArrowRightIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h13M13 6l6 6-6 6" />
  </svg>
);

const SparkIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.5l1.9 5.4 5.4 1.9-5.4 1.9L12 17.1l-1.9-5.4L4.7 9.8l5.4-1.9L12 2.5Z" />
  </svg>
);

/* ---------- Reusable bits ---------- */
const CopyButton: React.FC<{
  value: string;
  field: string;
  copiedField: string | null;
  onCopy: (value: string, field: string) => void;
  label?: string;
  className?: string;
}> = ({ value, field, copiedField, onCopy, label, className }) => {
  const active = copiedField === field;
  return (
    <button
      type="button"
      onClick={() => onCopy(value, field)}
      aria-label={label ?? 'Salin'}
      className={`inline-flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
        active ? 'text-brand-green' : 'text-brand-blue hover:underline'
      } ${className ?? ''}`}
    >
      {active ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
      {label && <span>{active ? 'Tersalin' : label}</span>}
    </button>
  );
};

const STATUS_STEPS = [
  { title: 'Pesanan dibuat', desc: 'Faktur diterbitkan oleh sistem' },
  { title: 'Pembayaran terverifikasi', desc: 'Dana QRIS diterima oleh gateway' },
  { title: 'Produk dikirim', desc: 'Serial number / token terkirim ke tujuan' },
];

const Timeline: React.FC<{ current: number; failed?: boolean }> = ({ current, failed }) => (
  <ol>
    {STATUS_STEPS.map((s, i) => {
      const done = i < current;
      const active = i === current;
      const isLast = i === STATUS_STEPS.length - 1;
      const bad = !!failed && isLast;
      return (
        <li key={s.title} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                done
                  ? 'bg-brand-green text-white'
                  : bad
                  ? 'bg-brand-red text-white'
                  : active
                  ? 'bg-white ring-2 ring-brand-red'
                  : 'bg-stone-100'
              }`}
            >
              {done ? (
                <CheckIcon className="w-3.5 h-3.5" />
              ) : (
                <span
                  className={`w-2 h-2 rounded-full ${
                    bad ? 'bg-white' : active ? 'bg-brand-red animate-pulse' : 'bg-stone-300'
                  }`}
                />
              )}
            </span>
            {!isLast && (
              <span
                className={`w-0.5 flex-1 my-1 rounded-full ${done ? 'bg-brand-green/40' : 'bg-stone-200'}`}
              />
            )}
          </div>
          <div className={isLast ? 'pb-0' : 'pb-4'}>
            <div
              className={`text-xs font-bold ${
                done ? 'text-brand-green' : bad ? 'text-brand-red' : 'text-brand-navy'
              }`}
            >
              {s.title}
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">{s.desc}</div>
          </div>
        </li>
      );
    })}
  </ol>
);

const DetailItem: React.FC<{
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  strong?: boolean;
}> = ({ label, value, mono, strong }) => (
  <div className="min-w-0">
    <div className="text-[11px] text-stone-500">{label}</div>
    <div
      className={`mt-0.5 ${strong ? 'text-lg font-extrabold' : 'text-sm font-bold'} text-brand-navy break-words ${
        mono ? 'font-mono num-tabular' : ''
      }`}
    >
      {value}
    </div>
  </div>
);

const STATUS_META: Record<
  VerifiedOrderDetail['status'],
  { label: string; tone: 'success' | 'warn' | 'danger'; step: number; failed?: boolean }
> = {
  SUCCESS: { label: 'Transaksi Berhasil', tone: 'success', step: 3 },
  PROCESSING: { label: 'Sedang Diproses', tone: 'warn', step: 2 },
  PENDING: { label: 'Menunggu Pembayaran', tone: 'warn', step: 1 },
  FAILED: { label: 'Gagal / Refund', tone: 'danger', step: 2, failed: true },
};

const TONE_CLASS: Record<'success' | 'warn' | 'danger', string> = {
  success: 'bg-emerald-100 text-emerald-800',
  warn: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
};

const TONE_DOT: Record<'success' | 'warn' | 'danger', string> = {
  success: 'bg-emerald-600',
  warn: 'bg-amber-600',
  danger: 'bg-red-600',
};

export const CekPesananPage: React.FC = () => {
  const { query } = useRouter();
  const [invoiceInput, setInvoiceInput] = useState(query.get('inv') || '');
  const [destInput, setDestInput] = useState(query.get('dest') || '');

  const [isLoading, setIsLoading] = useState(false);
  const [verifiedOrder, setVerifiedOrder] = useState<VerifiedOrderDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleSearch = async (inv = invoiceInput, dest = destInput) => {
    if (!inv.trim()) {
      setErrorMessage('Silakan masukkan Nomor Invoice.');
      return;
    }
    if (!dest.trim()) {
      setErrorMessage('Silakan masukkan Nomor HP atau Nomor Meter Tujuan untuk verifikasi.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setVerifiedOrder(null);
    setHasSearched(true);

    try {
      const response = await verifyOrder(inv, dest);
      if (response.success && response.data) {
        setVerifiedOrder(response.data);
      } else {
        setErrorMessage(
          response.error ||
            'Pesanan tidak ditemukan atau data verifikasi tidak cocok. Pastikan Nomor Invoice dan Nomor Tujuan sudah sesuai.'
        );
      }
    } catch {
      setErrorMessage('Terjadi gangguan saat memverifikasi pesanan. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-verifikasi jika datang dari deep-link (?inv=...&dest=...)
  useEffect(() => {
    const inv = query.get('inv');
    const dest = query.get('dest');
    if (inv && dest) {
      handleSearch(inv, dest);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(null), 2000);
  };

  const fillDemo = () => {
    setInvoiceInput('INV-2025-91204');
    setDestInput('081234567890');
    setErrorMessage(null);
  };

  const resetSearch = () => {
    setVerifiedOrder(null);
    setErrorMessage(null);
    setHasSearched(false);
  };

  const statusMeta = verifiedOrder ? STATUS_META[verifiedOrder.status] : null;

  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 pt-6 pb-16 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 mb-5" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-navy transition-colors">
          Beranda
        </Link>
        <span className="text-stone-300">/</span>
        <span className="text-brand-navy font-semibold">Cek Pesanan</span>
      </nav>

      {/* Page Header */}
      <header className="mb-7 sm:mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[11px] font-bold text-brand-blue uppercase tracking-wider mb-3">
          <ShieldIcon className="w-3.5 h-3.5" />
          Verifikasi Transaksi Resmi
        </div>
        <h1 className="text-[28px] leading-[1.15] sm:text-4xl font-extrabold text-brand-navy tracking-tight">
          Cek Pesanan
        </h1>
        <p className="text-sm sm:text-base text-stone-600 mt-2 leading-relaxed max-w-2xl">
          Masukkan nomor invoice dan nomor tujuan untuk melihat status serta rincian transaksi Anda.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {['Tanpa login', 'Nomor dimasking', 'Enkripsi 256-bit'].map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-600 bg-white border border-stone-200/90 rounded-full px-3 py-1"
            >
              <CheckIcon className="w-3 h-3 text-brand-green" />
              {t}
            </span>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* ---------- KIRI: FORM ---------- */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 space-y-4">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-xs"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="w-10 h-10 rounded-xl bg-brand-navy/5 text-brand-navy flex items-center justify-center shrink-0">
                  <SearchIcon className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-sm font-extrabold text-brand-navy">Lacak Transaksi</h2>
                  <p className="text-[11px] text-stone-500">Verifikasi 2 langkah demi keamanan data</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="invoice-input"
                    className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5"
                  >
                    Nomor Invoice <span className="text-brand-red">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
                      <ReceiptIcon className="w-[18px] h-[18px]" />
                    </span>
                    <input
                      id="invoice-input"
                      type="text"
                      value={invoiceInput}
                      onChange={(e) => {
                        setInvoiceInput(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="Contoh: INV-2025-91204"
                      className="w-full h-12 pl-11 pr-4 bg-stone-50 text-sm font-semibold uppercase tracking-wider text-brand-navy rounded-xl border border-stone-200 focus:outline-none focus:bg-white focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 transition-all placeholder:normal-case placeholder:tracking-normal placeholder:font-normal placeholder:text-stone-400"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="dest-input"
                    className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5"
                  >
                    Nomor HP / ID Pelanggan <span className="text-brand-red">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
                      <PinIcon className="w-[18px] h-[18px]" />
                    </span>
                    <input
                      id="dest-input"
                      type="tel"
                      inputMode="numeric"
                      value={destInput}
                      onChange={(e) => {
                        setDestInput(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="Contoh: 081234567890"
                      className="w-full h-12 pl-11 pr-4 bg-stone-50 text-sm font-semibold text-brand-navy num-tabular rounded-xl border border-stone-200 focus:outline-none focus:bg-white focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 transition-all placeholder:font-normal placeholder:text-stone-400"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1.5">
                    Dipakai untuk memastikan hanya pemilik transaksi yang bisa melihat detail.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-5 w-full h-12 rounded-xl bg-brand-navy hover:bg-stone-800 active:scale-[0.99] text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Memverifikasi…</span>
                  </>
                ) : (
                  <>
                    <SearchIcon className="w-[18px] h-[18px]" />
                    <span>Cari Pesanan</span>
                  </>
                )}
              </button>

              <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-stone-400">Belum punya data?</span>
                <button
                  type="button"
                  onClick={fillDemo}
                  className="text-[11px] font-bold text-brand-blue hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <SparkIcon className="w-3 h-3" />
                  Isi contoh data uji
                </button>
              </div>
            </form>

            {/* Kartu bantuan (desktop) */}
            <div className="hidden lg:block rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <ChatIcon className="w-4 h-4" />
                </span>
                <h3 className="text-xs font-extrabold text-brand-navy">Butuh bantuan?</h3>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Tim CS kami siap membantu pengecekan status transaksi, token PLN, hingga proses
                refund.
              </p>
              <a
                href="https://wa.me/6281234567890?text=Halo%20CS%20Fortiva%20Shop,%20saya%20butuh%20bantuan%20terkait%20pesanan"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <ChatIcon className="w-4 h-4" />
                Chat CS WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* ---------- KANAN: HASIL ---------- */}
        <div className="lg:col-span-7">
          <div className="space-y-4">
            {/* Loading skeleton */}
            {isLoading && (
              <div className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <span className="w-5 h-5 border-2 border-brand-red/25 border-t-brand-red rounded-full animate-spin" />
                  </span>
                  <div>
                    <h2 className="text-sm font-extrabold text-brand-navy">Memverifikasi transaksi…</h2>
                    <p className="text-[11px] text-stone-500">Menghubungi biller resmi Anda</p>
                  </div>
                </div>
                <div className="animate-pulse space-y-3">
                  <div className="h-4 w-2/3 rounded bg-stone-100" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-12 rounded-xl bg-stone-100" />
                    <div className="h-12 rounded-xl bg-stone-100" />
                    <div className="h-12 rounded-xl bg-stone-100" />
                    <div className="h-12 rounded-xl bg-stone-100" />
                  </div>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!hasSearched && !isLoading && (
              <div className="rounded-2xl border border-dashed border-stone-300/80 bg-white/70 p-6 sm:p-8">
                <div className="flex flex-col items-center text-center">
                  <span className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mb-4">
                    <ReceiptIcon className="w-7 h-7" />
                  </span>
                  <h2 className="text-sm font-extrabold text-brand-navy">Belum ada pencarian</h2>
                  <p className="text-xs text-stone-500 mt-1.5 max-w-sm leading-relaxed">
                    Lengkapi formulir untuk menampilkan rincian status transaksi, serial number,
                    atau token listrik Anda.
                  </p>
                </div>

                <div className="mt-6 grid gap-2">
                  {[
                    {
                      t: 'Nomor invoice ada pada bukti pembayaran atau halaman invoice Anda.',
                      icon: <ReceiptIcon className="w-4 h-4" />,
                    },
                    {
                      t: 'Gunakan nomor tujuan yang sama seperti saat bertransaksi.',
                      icon: <PinIcon className="w-4 h-4" />,
                    },
                    {
                      t: 'Data transaksi tersimpan aman selama 90 hari kalender.',
                      icon: <ClockIcon className="w-4 h-4" />,
                    },
                  ].map((item) => (
                    <div
                      key={item.t}
                      className="flex items-start gap-3 p-3 rounded-xl bg-stone-50/80 border border-stone-200/70"
                    >
                      <span className="w-7 h-7 rounded-lg bg-white text-stone-500 flex items-center justify-center shrink-0 border border-stone-200/80">
                        {item.icon}
                      </span>
                      <span className="text-[11px] text-stone-600 leading-relaxed pt-1">
                        {item.t}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error / Not found */}
            {errorMessage && !isLoading && (
              <div className="rounded-2xl border border-red-200 bg-white p-5 sm:p-6 shadow-xs">
                <div className="flex items-start gap-3.5">
                  <span className="w-10 h-10 rounded-full bg-red-50 text-brand-red flex items-center justify-center shrink-0">
                    <AlertIcon className="w-5 h-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-extrabold text-brand-navy">
                      Pesanan Tidak Ditemukan
                    </h2>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">{errorMessage}</p>
                    <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center gap-x-4 gap-y-2">
                      <a
                        href="https://wa.me/6281234567890?text=Halo%20CS%20Fortiva%20Shop,%20saya%20butuh%20bantuan%20terkait%20pesanan"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                      >
                        <ChatIcon className="w-4 h-4" />
                        Hubungi CS
                      </a>
                      <button
                        type="button"
                        onClick={resetSearch}
                        className="text-xs font-semibold text-stone-500 hover:text-brand-navy cursor-pointer"
                      >
                        Reset pencarian
                      </button>
                      <Link
                        href="/panduan-qris"
                        className="text-xs font-semibold text-brand-blue hover:underline inline-flex items-center gap-1"
                      >
                        Lihat panduan
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Verified order result */}
            {verifiedOrder && !isLoading && (
              <div className="space-y-3 animate-fade-up">
                <div className="rounded-2xl border border-stone-200/90 bg-white shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="p-5 sm:p-6 flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                        Hasil Verifikasi Resmi
                      </span>
                      <h2 className="text-xl font-extrabold text-brand-navy font-mono mt-1 break-all">
                        {verifiedOrder.invoiceNumber}
                      </h2>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                        statusMeta ? TONE_CLASS[statusMeta.tone] : ''
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          statusMeta ? TONE_DOT[statusMeta.tone] : ''
                        }`}
                      />
                      {statusMeta?.label}
                    </span>
                  </div>

                  {/* Timeline status */}
                  <div className="px-5 sm:px-6 pb-5">
                    <div className="rounded-xl bg-stone-50/70 border border-stone-200/70 p-4">
                      <Timeline
                        current={statusMeta?.step ?? 3}
                        failed={statusMeta?.failed}
                      />
                    </div>
                  </div>

                  {/* Garis sobekan struk */}
                  <div className="relative">
                    <div className="border-t-2 border-dashed border-stone-200 mx-5 sm:mx-6" />
                    <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#F7F6F2]" />
                    <span className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#F7F6F2]" />
                  </div>

                  {/* Rincian */}
                  <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <DetailItem
                      label="Layanan"
                      value={`${verifiedOrder.categoryName} - ${verifiedOrder.nominalLabel}`}
                    />
                    <DetailItem label="Provider / Biller" value={verifiedOrder.providerName} />
                    <DetailItem label="Nomor Tujuan" value={verifiedOrder.maskedDestination} mono />
                    <DetailItem label="Metode Pembayaran" value={verifiedOrder.paymentMethod} />
                    <DetailItem label="Waktu Transaksi" value={verifiedOrder.createdAt} />
                    <DetailItem
                      label="Total Pembayaran"
                      value={`Rp${verifiedOrder.totalPrice.toLocaleString('id-ID')}`}
                      strong
                      mono
                    />
                  </div>

                  {/* Token Listrik */}
                  {verifiedOrder.tokenPln && (
                    <div className="px-5 sm:px-6 pb-5">
                      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <span className="text-[11px] font-bold text-brand-blue uppercase tracking-wider">
                            Token Listrik 20 Digit
                          </span>
                          <CopyButton
                            value={verifiedOrder.tokenPln.replace(/-/g, '')}
                            field="token"
                            copiedField={copiedField}
                            onCopy={handleCopy}
                            label="Salin"
                            className="text-[11px] shrink-0"
                          />
                        </div>
                        <div className="font-mono text-base font-black text-brand-navy tracking-wider text-center py-2.5 bg-white rounded-xl border border-blue-100">
                          {verifiedOrder.tokenPln}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Serial Number */}
                  {verifiedOrder.serialNumber && (
                    <div className="px-5 sm:px-6 pb-5">
                      <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                        <div className="min-w-0">
                          <span className="block text-[11px] text-stone-500">
                            Serial Number (SN)
                          </span>
                          <span className="font-mono font-bold text-brand-navy text-xs break-all">
                            {verifiedOrder.serialNumber}
                          </span>
                        </div>
                        <CopyButton
                          value={verifiedOrder.serialNumber}
                          field="sn"
                          copiedField={copiedField}
                          onCopy={handleCopy}
                          label="Salin"
                          className="text-[11px] shrink-0"
                        />
                      </div>
                    </div>
                  )}

                  {/* Aksi */}
                  <div className="px-5 sm:px-6 pb-5 flex flex-col sm:flex-row gap-2">
                    <a
                      href={verifiedOrder.supportLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors"
                    >
                      <ChatIcon className="w-4 h-4" />
                      Bantuan CS WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(verifiedOrder.invoiceNumber, 'invoice')}
                      className="flex-1 h-11 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      {copiedField === 'invoice' ? (
                        <CheckIcon className="w-4 h-4 text-brand-green" />
                      ) : (
                        <CopyIcon className="w-4 h-4" />
                      )}
                      {copiedField === 'invoice' ? 'Invoice Tersalin' : 'Salin Invoice'}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-stone-500 leading-relaxed px-1">
                  Ada kendala saldo belum masuk atau token tidak valid? Simpan nomor invoice di atas
                  lalu hubungi CS resmi kami untuk pengecekan langsung ke biller.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



