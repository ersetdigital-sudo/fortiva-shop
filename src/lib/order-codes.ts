/**
 * Pembuat kode pesanan: nomor invoice, serial number, dan token PLN.
 *
 * SEMUA fungsi di sini hanya untuk server. Nilai serial/token sengaja TIDAK
 * dibuat saat checkout — baru diterbitkan admin setelah pembayaran terbukti
 * masuk (lihat `verifyPayment` -> `processOrder` di admin actions).
 */

/** Nomor invoice: INV-<tahun>-<5 digit>. */
export function buildInvoiceNumber(): string {
  const year = new Date().getFullYear();
  return `INV-${year}-${Math.floor(10000 + Math.random() * 90000)}`;
}

/** Serial number: YYYYMMDDHHmm + 6 digit acak. */
export function buildSerialNumber(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(
    now.getHours()
  )}${pad(now.getMinutes())}`;
  return `${stamp}${Math.floor(100000 + Math.random() * 900000)}`;
}

/** Token PLN 20 digit, dikelompokkan 5x4. */
export function buildPlnToken(): string {
  return Array.from({ length: 5 }, () => Math.floor(1000 + Math.random() * 9000)).join('-');
}
