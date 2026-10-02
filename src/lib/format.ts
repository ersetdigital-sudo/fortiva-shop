export function formatRupiah(value: number | string | null | undefined): string {
  const numeric = typeof value === 'string' ? Number(value) : (value ?? 0);
  if (!Number.isFinite(numeric)) return 'Rp0';

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numeric);
}

export function formatNumber(value: number | string | null | undefined): string {
  const numeric = typeof value === 'string' ? Number(value) : (value ?? 0);
  if (!Number.isFinite(numeric)) return '0';
  return new Intl.NumberFormat('id-ID').format(numeric);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(date);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeZone: 'Asia/Jakarta',
  }).format(date);
}
