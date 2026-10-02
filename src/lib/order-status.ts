/**
 * Status pesanan & peta langkah verifikasi.
 *
 * ATURAN PENTING: aksi "Saya Sudah Bayar" dari pelanggan BUKAN bukti
 * pembayaran. Status berubah jadi SUCCESS hanya setelah admin memverifikasi
 * dana masuk dan produk benar-benar terkirim.
 */

export const ORDER_STATUSES = [
  'PENDING_PAYMENT',
  'WAITING_VERIFICATION',
  'VERIFIED',
  'PROCESSING',
  'SUCCESS',
  'FAILED',
  'EXPIRED',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Menunggu Pembayaran',
  WAITING_VERIFICATION: 'Menunggu Verifikasi',
  VERIFIED: 'Pembayaran Terverifikasi',
  PROCESSING: 'Sedang Diproses',
  SUCCESS: 'Transaksi Berhasil',
  FAILED: 'Pembayaran Tidak Ditemukan',
  EXPIRED: 'Kedaluwarsa',
};

/** Empat langkah besar yang ditampilkan di halaman verifikasi. */
export const TIMELINE_STEPS = [
  { title: 'Pesanan Dibuat', desc: 'Nomor invoice diterbitkan sistem' },
  { title: 'QRIS Dibuat', desc: 'Kode pembayaran siap dipindai' },
  { title: 'Pembayaran Dilaporkan', desc: 'Kamu menandai pembayaran sudah dibayar' },
  { title: 'Menunggu Verifikasi', desc: 'Tim kami memeriksa dana yang masuk' },
  { title: 'Transaksi Diproses', desc: 'Produk dikirim ke biller' },
  { title: 'Selesai', desc: 'Serial number / token terkirim' },
] as const;

/**
 * Indeks langkah yang sedang aktif.
 * Nilai sama dengan jumlah langkah yang sudah selesai:
 *   index < current  -> selesai (centang)
 *   index === current -> sedang berjalan
 *   index > current  -> belum dimulai
 */
export function timelineIndex(status: OrderStatus): number {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 1;
    case 'WAITING_VERIFICATION':
      return 3;
    case 'VERIFIED':
      return 4;
    case 'PROCESSING':
      return 4;
    case 'SUCCESS':
      return TIMELINE_STEPS.length;
    case 'FAILED':
    case 'EXPIRED':
      return 2;
    default:
      return 0;
  }
}

/** Status yang berarti pembayaran sudah terbukti masuk. */
export function isPaid(status: OrderStatus): boolean {
  return status === 'VERIFIED' || status === 'PROCESSING' || status === 'SUCCESS';
}

/** Hasil produk (serial/token) hanya boleh tampil setelah pembayaran terbukti. */
export function canRevealProduct(status: OrderStatus): boolean {
  return isPaid(status);
}

/** Status netral/negatif untuk pewarnaan UI (jangan pakai hijau sebelum sukses). */
export function statusTone(status: OrderStatus): 'neutral' | 'success' | 'danger' {
  if (status === 'SUCCESS') return 'success';
  if (status === 'FAILED' || status === 'EXPIRED') return 'danger';
  return 'neutral';
}

/** Normalisasi nilai apa pun dari database menjadi OrderStatus yang valid. */
export function normalizeOrderStatus(value: unknown): OrderStatus {
  const raw = String(value ?? '').toUpperCase();
  return (ORDER_STATUSES as readonly string[]).includes(raw)
    ? (raw as OrderStatus)
    : 'PENDING_PAYMENT';
}

export function statusLabel(value: unknown): string {
  return STATUS_LABELS[normalizeOrderStatus(value)];
}
