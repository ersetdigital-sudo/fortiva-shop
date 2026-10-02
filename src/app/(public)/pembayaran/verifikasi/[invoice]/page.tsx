import type { Metadata } from 'next';
import Link from 'next/link';
import { getPaymentStatus } from '@/app/actions/orders';
import { RefreshStatusButton } from '@/components/RefreshStatusButton';
import { formatDateTime, formatRupiah } from '@/lib/format';
import {
  STATUS_LABELS,
  TIMELINE_STEPS,
  canRevealProduct,
  normalizeOrderStatus,
  statusTone,
  timelineIndex,
  type OrderStatus,
} from '@/lib/order-status';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Status Pembayaran | Fortiva Shop',
  description:
    'Pantau status verifikasi pembayaran transaksi Fortiva Shop menggunakan nomor invoice.',
  robots: { index: false, follow: false },
};

type IconProps = { className?: string };

const CheckIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5 L10 17.5 L19 7" />
  </svg>
);

const ClockIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </svg>
);

const AlertIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.4h.01" />
  </svg>
);

const ChatIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12a7.5 7.5 0 0 1-11 6.6L4 20l1.4-4.2A7.5 7.5 0 1 1 20 12Z" />
  </svg>
);

const SearchIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.6-3.6" />
  </svg>
);

const CopyIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H16" />
  </svg>
);

/* ------------------------------------------------------------------ *
 * Copy per status
 * ------------------------------------------------------------------ */
const HEADLINED: Record<
  OrderStatus,
  { title: string; lead: string; note: string; tone: 'neutral' | 'success' | 'danger' }
> = {
  PENDING_PAYMENT: {
    title: 'Menunggu Pembayaran',
    lead: 'Pesanan sudah dibuat. Selesaikan pembayaran QRIS, lalu tekan tombol "Saya Sudah Bayar" di halaman checkout.',
    note: 'Transaksi akan diproses setelah pembayaran dikonfirmasi.',
    tone: 'neutral',
  },
  WAITING_VERIFICATION: {
    title: 'Pembayaran Sedang Diverifikasi',
    lead: 'Terima kasih. Kami sudah menerima laporan pembayaran kamu. Tim kami akan memeriksa pembayaran sebelum transaksi diproses.',
    note: 'Pembayaran kamu sudah dilaporkan dan sedang diperiksa oleh tim kami. Status akan berubah setelah pembayaran dikonfirmasi.',
    tone: 'neutral',
  },
  VERIFIED: {
    title: 'Pembayaran Terverifikasi',
    lead: 'Pembayaran sudah dikonfirmasi. Pesanan masuk ke tahap pemrosesan produk.',
    note: 'Produk sedang disiapkan untuk dikirim ke biller.',
    tone: 'neutral',
  },
  PROCESSING: {
    title: 'Transaksi Sedang Diproses',
    lead: 'Produk sedang dikirim ke biller. Serial number atau token muncul di halaman ini setelah selesai.',
    note: 'Muat ulang halaman ini beberapa saat lagi untuk melihat hasilnya.',
    tone: 'neutral',
  },
  SUCCESS: {
    title: 'Pembayaran Berhasil',
    lead: 'Transaksi sudah selesai diproses dan produk berhasil dikirim ke tujuan.',
    note: 'Simpan nomor invoice ini sebagai bukti transaksi.',
    tone: 'success',
  },
  FAILED: {
    title: 'Perlu Verifikasi Ulang',
    lead: 'Kami belum menemukan pembayaran yang cocok dengan invoice ini. Kirim bukti pembayaran ke CS agar bisa diperiksa ulang.',
    note: 'Kalau kamu yakin sudah membayar, hubungi CS dengan nomor invoice di atas.',
    tone: 'danger',
  },
  EXPIRED: {
    title: 'Pembayaran Kedaluwarsa',
    lead: 'Batas waktu pembayaran QRIS sudah lewat sehingga transaksi ini ditutup.',
    note: 'Silakan buat pesanan baru untuk melanjutkan.',
    tone: 'danger',
  },
};

const TONE_BADGE: Record<'neutral' | 'success' | 'danger', string> = {
  neutral: 'bg-amber-100 text-amber-800',
  success: 'bg-emerald-100 text-emerald-800',
  danger: 'bg-red-100 text-red-800',
};

const TONE_DOT: Record<'neutral' | 'success' | 'danger', string> = {
  neutral: 'bg-amber-600',
  success: 'bg-emerald-600',
  danger: 'bg-red-600',
};

/* ------------------------------------------------------------------ *
 * Timeline
 * ------------------------------------------------------------------ */
const Timeline: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const current = timelineIndex(status);
  const failed = status === 'FAILED' || status === 'EXPIRED';

  return (
    <ol className="space-y-0">
      {TIMELINE_STEPS.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const isLast = index === TIMELINE_STEPS.length - 1;
        const bad = failed && index === current;

        return (
          <li key={step.title} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  done
                    ? 'bg-emerald-600 text-white'
                    : bad
                      ? 'bg-red-600 text-white'
                      : active
                        ? 'bg-white ring-2 ring-amber-500'
                        : 'bg-stone-100 ring-1 ring-stone-200'
                }`}
              >
                {done ? (
                  <CheckIcon className="h-3.5 w-3.5" />
                ) : bad ? (
                  <AlertIcon className="h-3.5 w-3.5" />
                ) : (
                  <span
                    className={`h-2 w-2 rounded-full ${
                      active ? 'animate-pulse bg-amber-500' : 'bg-stone-300'
                    }`}
                  />
                )}
              </span>
              {!isLast && (
                <span
                  className={`my-1 w-0.5 flex-1 rounded-full ${
                    done ? 'bg-emerald-200' : 'bg-stone-200'
                  }`}
                />
              )}
            </div>
            <div className={isLast ? 'pb-0' : 'pb-4'}>
              <p
                className={`text-xs font-bold ${
                  done ? 'text-emerald-700' : bad ? 'text-red-700' : 'text-brand-navy'
                }`}
              >
                {step.title}
              </p>
              <p className="mt-0.5 text-[11px] text-stone-500">{step.desc}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

const DetailRow: React.FC<{ label: string; value: React.ReactNode; mono?: boolean }> = ({
  label,
  value,
  mono,
}) => (
  <div className="flex items-start justify-between gap-4 border-b border-stone-100 py-3 last:border-0">
    <span className="shrink-0 text-[12px] text-stone-500">{label}</span>
    <span
      className={`text-right text-[13px] font-bold text-brand-navy ${mono ? 'num-tabular font-mono' : ''}`}
    >
      {value}
    </span>
  </div>
);

/* ------------------------------------------------------------------ *
 * Halaman
 * ------------------------------------------------------------------ */
export default async function PaymentVerificationPage({
  params,
}: {
  params: Promise<{ invoice: string }>;
}) {
  const { invoice } = await params;
  const decodedInvoice = decodeURIComponent(invoice ?? '');
  const summary = await getPaymentStatus(decodedInvoice);

  if (!summary.found) {
    return (
      <main className="mx-auto max-w-[640px] px-4 pb-16 pt-8 sm:px-6 sm:py-12">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-xs">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-brand-red">
            <AlertIcon className="h-7 w-7" />
          </span>
          <h1 className="text-lg font-extrabold text-brand-navy">Invoice Tidak Ditemukan</h1>
          <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-stone-600">
            Nomor invoice <span className="font-mono font-bold">{decodedInvoice || '—'}</span> tidak
            ada di sistem kami. Periksa kembali nomor invoice pada bukti transaksi kamu.
          </p>
          <Link
            href="/cek-pesanan"
            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy text-sm font-bold text-white transition-colors hover:bg-stone-800 sm:w-auto sm:px-6"
          >
            <SearchIcon className="h-[18px] w-[18px]" />
            Cek Pesanan
          </Link>
        </div>
      </main>
    );
  }

  const status = normalizeOrderStatus(summary.status);
  const content = HEADLINED[status];
  const tone = statusTone(status) === 'success' ? 'success' : content.tone;
  const reveal = canRevealProduct(status);

  return (
    <main className="mx-auto max-w-[720px] px-4 pb-16 pt-6 sm:px-6 sm:py-12">
      {/* Judul + status */}
      <header className="text-center">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${TONE_BADGE[tone]}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[tone]}`} />
          {STATUS_LABELS[status].toUpperCase()}
        </span>
        <h1 className="mt-3 text-[22px] font-extrabold leading-tight tracking-tight text-brand-navy sm:text-3xl">
          {content.title}
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-stone-600">
          {content.lead}
        </p>
      </header>

      {/* Ringkasan pesanan */}
      <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
        <h2 className="text-[13px] font-extrabold text-brand-navy">Ringkasan Pesanan</h2>
        <div className="mt-2">
          <DetailRow label="Invoice" value={summary.invoiceNumber} mono />
          <DetailRow label="Produk" value={summary.nominalLabel} />
          <DetailRow label="Layanan" value={summary.categoryName || summary.providerName || '—'} />
          <DetailRow label="Total" value={formatRupiah(summary.totalPrice ?? 0)} mono />
          <DetailRow label="Metode" value={summary.paymentMethod ?? 'QRIS'} />
          <DetailRow label="Waktu Pesanan" value={formatDateTime(summary.createdAt)} />
          <DetailRow label="Status" value={STATUS_LABELS[status]} />
        </div>
      </section>

      {/* Hasil produk — hanya setelah pembayaran terbukti */}
      {reveal && (summary.serialNumber || summary.tokenPln) && (
        <section className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            {summary.tokenPln ? 'Token Listrik 20 Digit' : 'Serial Number'}
          </h2>
          <p className="mt-2 break-all rounded-xl border border-emerald-200 bg-white px-3 py-3 text-center font-mono text-sm font-black tracking-wider text-brand-navy">
            {summary.tokenPln ?? summary.serialNumber}
          </p>
        </section>
      )}

      {/* Timeline verifikasi */}
      <section className="mt-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <ClockIcon className="h-4 w-4" />
          </span>
          <h2 className="text-[13px] font-extrabold text-brand-navy">Alur Transaksi</h2>
        </div>
        <Timeline status={status} />
      </section>

      <p className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-[11px] leading-relaxed text-stone-600">
        {content.note}
      </p>

      {/* CTA — target sentuh minimal 48px */}
      <div className="mt-5 flex flex-col gap-2.5">
        <RefreshStatusButton />

        <Link
          href={`/cek-pesanan?inv=${encodeURIComponent(summary.invoiceNumber ?? '')}`}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white text-sm font-bold text-brand-navy transition-colors hover:bg-stone-50"
        >
          <SearchIcon className="h-[18px] w-[18px]" />
          Cek Pesanan
        </Link>

        {summary.supportLink && (
          <a
            href={summary.supportLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
          >
            <ChatIcon className="h-[18px] w-[18px]" />
            Hubungi WhatsApp CS
          </a>
        )}

        {(status === 'FAILED' || status === 'EXPIRED') && (
          <Link
            href="/"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-stone-100 text-sm font-bold text-stone-700 transition-colors hover:bg-stone-200"
          >
            Buat Pesanan Baru
          </Link>
        )}
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-stone-400">
        <CopyIcon className="h-3.5 w-3.5" />
        Simpan nomor invoice untuk mengecek status kapan saja.
      </p>
    </main>
  );
}
