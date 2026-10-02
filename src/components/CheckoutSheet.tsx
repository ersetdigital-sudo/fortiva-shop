'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TransactionRecord } from '../types';
import { useRouter } from '../router';
import { useCatalog } from '../lib/catalog-context';
import { setting } from '../lib/catalog-types';
import { cldUrl } from '../lib/cloudinary-url';

type CheckoutStep = 'review' | 'payment' | 'processing';

/** Hasil pelaporan pembayaran ke server. */
export interface ReportPaymentResult {
  ok: boolean;
  invoiceNumber?: string;
  error?: string;
}

interface CheckoutSheetProps {
  isOpen: boolean;
  transaction: TransactionRecord | null;
  onClose: () => void;
  /**
   * Dipanggil saat pelanggan menekan "Saya Sudah Bayar".
   * Ini HANYA melaporkan pembayaran — status berubah jadi menunggu verifikasi,
   * bukan berhasil.
   */
  onConfirmPayment: (tx: TransactionRecord) => Promise<ReportPaymentResult>;
}

const STEP_LABELS = ['Konfirmasi', 'Bayar', 'Verifikasi'];

const PROCESS_STEPS = [
  { title: 'Mengirim laporan pembayaran', desc: 'Menyimpan nomor invoice & detail pesanan' },
  { title: 'Menyiapkan verifikasi', desc: 'Laporan diteruskan ke tim pemeriksa' },
];

const HEADERS: Record<CheckoutStep, { title: string; subtitle: string }> = {
  review: { title: 'Konfirmasi Pesanan', subtitle: 'Periksa kembali detail transaksi kamu' },
  payment: { title: 'Pembayaran QRIS', subtitle: 'Scan QRIS atau transfer, lalu laporkan' },
  processing: { title: 'Mengirim Laporan', subtitle: 'Mohon tunggu sebentar' },
};

/* ---------- Inline icons (SVG, tidak bergantung font ikon) ---------- */
const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const BoltIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 40 40" fill="currentColor" aria-hidden="true">
    <path d="M24.5 6.5 L13 22.2 L19.6 22.2 L15.5 33.5 L27 17.8 L20.4 17.8 Z" />
  </svg>
);

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H16" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5 L10 17.5 L19 7" />
  </svg>
);

/* ---------- Small helpers ---------- */
const Row: React.FC<{
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  accent?: 'default' | 'success';
}> = ({ label, value, mono, accent = 'default' }) => (
  <div className="flex items-start justify-between gap-4">
    <span className="text-stone-500 shrink-0">{label}</span>
    <span
      className={`font-bold text-right ${
        accent === 'success' ? 'text-brand-green' : 'text-brand-navy'
      } ${mono ? 'num-tabular font-mono' : ''}`}
    >
      {value}
    </span>
  </div>
);

const rupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`;

export const CheckoutSheet: React.FC<CheckoutSheetProps> = ({
  isOpen,
  transaction,
  onClose,
  onConfirmPayment,
}) => {
  const { navigate } = useRouter();
  const { settings, bankAccounts } = useCatalog();
  const qrisImage = setting(settings, 'qris_image_url', '');
  const qrisMerchant = setting(settings, 'qris_merchant', 'Fortiva Shop');
  const paymentInstructions = setting(
    settings,
    'payment_instructions',
    'Scan QRIS dengan aplikasi bank atau e-wallet apa pun.'
  );
  const [step, setStep] = useState<CheckoutStep>('review');
  const [processIndex, setProcessIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(14 * 60 + 59);
  const [copied, setCopied] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  // Reset state setiap kali dibuka dengan transaksi baru
  useEffect(() => {
    if (isOpen) {
      setStep('review');
      setProcessIndex(0);
      setSecondsLeft(14 * 60 + 59);
      setCopied(null);
      setReportError(null);
    }
    return () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current = [];
    };
  }, [isOpen, transaction?.id]);

  // Hitung mundur masa berlaku QRIS
  useEffect(() => {
    if (!isOpen || step !== 'payment') return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, step]);

  if (!isOpen || !transaction) return null;

  const tx = transaction;
  const activeIndex = step === 'review' ? 0 : 1;
  const header = HEADERS[step];

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    timers.current.push(window.setTimeout(() => setCopied(null), 2000));
  };

  /**
   * Melaporkan pembayaran ke server, lalu pindah ke halaman status verifikasi.
   * TIDAK pernah menampilkan "berhasil" — verifikasi dilakukan admin.
   */
  const startPayment = () => {
    setReportError(null);
    setStep('processing');
    setProcessIndex(0);
    timers.current.push(window.setTimeout(() => setProcessIndex(1), 700));
    timers.current.push(
      window.setTimeout(async () => {
        try {
          const result = await onConfirmPayment(tx);
          if (!result.ok) {
            setReportError(result.error ?? 'Gagal melaporkan pembayaran. Coba lagi.');
            setStep('payment');
            return;
          }
          navigate(`/pembayaran/verifikasi/${result.invoiceNumber ?? tx.invoiceNumber}`);
        } catch {
          setReportError('Tidak dapat menghubungi server. Coba lagi.');
          setStep('payment');
        }
      }, 1500)
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-brand-navy/60 backdrop-blur-sm animate-fade">
      <div className="relative w-full max-w-full sm:max-w-md max-h-[92vh] sm:max-h-[94vh] overflow-y-auto overscroll-contain bg-white rounded-t-[28px] sm:rounded-3xl border border-stone-200 shadow-2xl animate-pop pb-[env(safe-area-inset-bottom)]">
        {/* Drag handle (mobile) */}
        <div className="sm:hidden pt-3 flex justify-center">
          <span className="w-10 h-1.5 rounded-full bg-stone-200" />
        </div>

        {/* Header + step indicator */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl px-5 pt-4 pb-3 border-b border-stone-100">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-brand-navy tracking-tight">
                {header.title}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5 truncate">{header.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex-1">
                <div
                  className={`h-1.5 rounded-full transition-colors duration-300 ${
                    i <= activeIndex ? 'bg-brand-red' : 'bg-stone-200'
                  }`}
                />
                <div
                  className={`mt-1 text-[10px] font-bold tracking-wide ${
                    i <= activeIndex ? 'text-brand-red' : 'text-stone-400'
                  }`}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 sm:px-5 py-4 sm:py-5">
          {step === 'review' && (
            <div className="space-y-4 animate-fade-up">
              <div className="rounded-2xl border border-stone-200/90 overflow-hidden">
                <div className="flex items-center gap-3 p-4 bg-stone-50/70 border-b border-stone-100">
                  <span className="w-11 h-11 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0">
                    <span className="w-8 h-8 rounded-lg bg-brand-red flex items-center justify-center">
                      <BoltIcon className="w-5 h-5 text-white" />
                    </span>
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-brand-navy truncate">
                      {tx.providerName}
                    </div>
                    <div className="text-[11px] text-stone-500 truncate">
                      {tx.categoryName} · {tx.nominalLabel}
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3 text-xs">
                  <Row label="Nomor Tujuan" value={tx.destination} mono />
                  <Row label="Harga Produk" value={rupiah(tx.totalPrice - tx.adminFee)} />
                  <Row
                    label="Biaya Layanan"
                    value={tx.adminFee > 0 ? rupiah(tx.adminFee) : 'Gratis'}
                    accent={tx.adminFee === 0 ? 'success' : 'default'}
                  />
                </div>
                <div className="p-4 bg-[#FFE78F]/40 border-t border-amber-200/70 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Total Bayar
                  </span>
                  <span className="text-xl font-extrabold text-brand-navy num-tabular">
                    {rupiah(tx.totalPrice)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-stone-500 leading-relaxed">
                Pastikan nomor tujuan sudah benar. Produk diproses setelah pembayaran QRIS
                diverifikasi oleh tim kami.
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-12 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm transition-colors cursor-pointer"
                >
                  Ubah Pesanan
                </button>
                <button
                  type="button"
                  onClick={() => setStep('payment')}
                  className="flex-[1.6] h-12 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white font-bold text-sm shadow-xs transition-all active:scale-[0.99] cursor-pointer"
                >
                  Lanjut ke Pembayaran
                </button>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-4 animate-fade-up">
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-blue bg-blue-50 px-3 py-1 rounded-full">
                  QRIS · Standar Nasional
                </span>
                <div className="mt-2 text-xl sm:text-2xl font-extrabold text-brand-navy num-tabular">
                  {rupiah(tx.totalPrice)}
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5 font-mono">
                  {tx.invoiceNumber}
                </p>
              </div>

              {/* QR code + scan animation */}
              <div className="relative mx-auto w-40 h-40 sm:w-52 sm:h-52 p-2.5 sm:p-3 bg-white border border-stone-200 rounded-2xl shadow-2xs overflow-hidden">
                {qrisImage ? (
                  <img
                    src={cldUrl(qrisImage, { w: 480, crop: 'limit' })}
                    alt={`QRIS ${qrisMerchant}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full"
                  fill="#111827"
                  role="img"
                  aria-label="Kode QRIS"
                >
                  <rect x="4" y="4" width="26" height="26" rx="6" fill="#111827" />
                  <rect x="8" y="8" width="18" height="18" rx="3" fill="#fff" />
                  <rect x="12" y="12" width="10" height="10" rx="1.5" fill="#111827" />
                  <rect x="70" y="4" width="26" height="26" rx="6" fill="#111827" />
                  <rect x="74" y="8" width="18" height="18" rx="3" fill="#fff" />
                  <rect x="78" y="12" width="10" height="10" rx="1.5" fill="#111827" />
                  <rect x="4" y="70" width="26" height="26" rx="6" fill="#111827" />
                  <rect x="8" y="74" width="18" height="18" rx="3" fill="#fff" />
                  <rect x="12" y="78" width="10" height="10" rx="1.5" fill="#111827" />
                  <circle cx="40" cy="8" r="2.6" />
                  <circle cx="48" cy="14" r="2.2" />
                  <circle cx="56" cy="8" r="2.6" />
                  <circle cx="64" cy="14" r="2.2" />
                  <circle cx="40" cy="22" r="2.2" />
                  <circle cx="52" cy="22" r="2.6" />
                  <circle cx="62" cy="24" r="2.2" />
                  <circle cx="8" cy="40" r="2.6" />
                  <circle cx="18" cy="48" r="2.2" />
                  <circle cx="8" cy="56" r="2.2" />
                  <circle cx="20" cy="60" r="2.6" />
                  <circle cx="36" cy="36" r="2.4" fill="#F2352B" />
                  <circle cx="48" cy="42" r="2.6" />
                  <circle cx="60" cy="36" r="2.2" />
                  <circle cx="72" cy="40" r="2.6" />
                  <circle cx="86" cy="48" r="2.2" />
                  <circle cx="42" cy="56" r="2.6" />
                  <circle cx="56" cy="60" r="2.2" />
                  <circle cx="68" cy="56" r="2.6" />
                  <circle cx="82" cy="62" r="2.2" />
                  <circle cx="36" cy="80" r="2.6" />
                  <circle cx="48" cy="86" r="2.2" />
                  <circle cx="60" cy="80" r="2.6" />
                  <circle cx="72" cy="88" r="2.2" />
                  <circle cx="86" cy="82" r="2.6" />
                </svg>
                )}

                {/* Logo chip di tengah QR */}
                {!qrisImage && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white flex items-center justify-center shadow-md">
                      <span className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-brand-red flex items-center justify-center">
                        <BoltIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </span>
                    </span>
                  </div>
                )}

                {/* Garis scan */}
                <span className="pointer-events-none absolute left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-transparent via-brand-red to-transparent animate-scan" />
              </div>

              {paymentInstructions && (
                <p className="text-[11px] text-stone-500 leading-relaxed text-center">
                  {paymentInstructions}
                </p>
              )}

              <div className="flex items-center justify-between rounded-xl bg-stone-50 border border-stone-200/80 px-4 py-3 text-xs">
                <span className="text-stone-500">Berlaku sampai</span>
                <span className="font-bold text-brand-navy num-tabular">
                  {timeFormatted}
                </span>
              </div>

              {bankAccounts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Atau transfer ke rekening
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {bankAccounts.map((bank) => (
                      <div
                        key={bank.id}
                        className="flex items-center gap-3 rounded-xl border border-stone-200/90 bg-stone-50/60 px-3 py-2.5"
                      >
                        {bank.logoUrl ? (
                          <img
                            src={cldUrl(bank.logoUrl, { w: 80, h: 80, crop: 'fit' })}
                            alt={bank.bankName}
                            loading="lazy"
                            className="w-8 h-8 rounded-md object-contain bg-white border border-stone-200 shrink-0"
                          />
                        ) : (
                          <span className="w-8 h-8 rounded-md bg-white border border-stone-200 flex items-center justify-center text-[10px] font-black text-brand-navy shrink-0">
                            {bank.bankName.slice(0, 3).toUpperCase()}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] text-stone-500 truncate">
                            {bank.bankName}
                          </div>
                          <div className="text-sm font-extrabold text-brand-navy num-tabular truncate">
                            {bank.accountNumber}
                          </div>
                          <div className="text-[11px] text-stone-500 truncate">
                            a.n. {bank.accountName}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copy(bank.accountNumber, `bank-${bank.id}`)}
                          aria-label={`Salin nomor rekening ${bank.bankName}`}
                          className="w-7 h-7 rounded-md text-stone-400 hover:text-brand-blue hover:bg-stone-200/60 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        >
                          {copied === `bank-${bank.id}` ? (
                            <CheckIcon className="w-3.5 h-3.5 text-brand-green" />
                          ) : (
                            <CopyIcon className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reportError && (
                <p
                  role="alert"
                  className="rounded-xl border border-brand-red/25 bg-brand-red/5 px-3.5 py-2.5 text-[12px] font-medium text-brand-red"
                >
                  {reportError}
                </p>
              )}

              <div className="sticky bottom-0 -mx-4 sm:-mx-5 mt-1 border-t border-stone-100 bg-white/95 px-4 sm:px-5 pt-3 pb-1 backdrop-blur-xl">
                <button
                  type="button"
                  onClick={startPayment}
                  className="w-full h-12 rounded-xl bg-brand-navy hover:bg-stone-800 text-white font-bold text-sm shadow-xs transition-all active:scale-[0.99] cursor-pointer"
                >
                  Saya Sudah Bayar
                </button>
                <button
                  type="button"
                  onClick={() => setStep('review')}
                  className="mt-2 w-full h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Kembali
                </button>
                <p className="mt-2 text-[10px] text-stone-400 text-center">
                  {qrisMerchant}
                </p>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="space-y-5 animate-fade-up py-1">
              <div className="text-center">
                <span className="inline-flex w-14 h-14 rounded-full bg-red-50 items-center justify-center">
                  <span className="w-7 h-7 border-[3px] border-brand-red/25 border-t-brand-red rounded-full animate-spin" />
                </span>
                <p className="mt-3 text-sm font-extrabold text-brand-navy">
                  Mengirim laporan pembayaran…
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  Mohon jangan tutup halaman ini
                </p>
              </div>

              <div className="space-y-2">
                {PROCESS_STEPS.map((item, i) => {
                  const done = i < processIndex;
                  const active = i === processIndex;
                  return (
                    <div
                      key={item.title}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                        done
                          ? 'bg-emerald-50/60 border-emerald-200/70'
                          : active
                          ? 'bg-red-50/50 border-red-200/70'
                          : 'bg-stone-50 border-stone-200/70 opacity-60'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          done
                            ? 'bg-brand-green text-white'
                            : active
                            ? 'bg-white'
                            : 'bg-stone-200 text-stone-400'
                        }`}
                      >
                        {done ? (
                          <CheckIcon className="w-4 h-4" />
                        ) : active ? (
                          <span className="w-3.5 h-3.5 border-2 border-brand-red/25 border-t-brand-red rounded-full animate-spin" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div
                          className={`text-xs font-bold ${
                            done ? 'text-brand-green' : 'text-brand-navy'
                          }`}
                        >
                          {item.title}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

