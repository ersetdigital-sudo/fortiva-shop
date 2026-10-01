import { ProductCategory, ProviderItem, NominalItem } from '../types';

export const CATEGORIES_CONFIG: Record<
  ProductCategory,
  {
    name: string;
    label: string;
    inputLabel: string;
    inputPlaceholder: string;
    helperText: string;
  }
> = {
  pulsa: {
    name: 'Pulsa Reguler',
    label: 'Pulsa',
    inputLabel: 'Nomor Handphone',
    inputPlaceholder: '08xxxxxxxxxx',
    helperText: 'Pastikan nomor ponsel aktif untuk menerima serial number (SN).',
  },
  data: {
    name: 'Paket Data Kuota',
    label: 'Paket Data',
    inputLabel: 'Nomor Handphone',
    inputPlaceholder: '08xxxxxxxxxx',
    helperText: 'Kuota langsung aktif 24 jam setelah pembayaran QRIS diverifikasi.',
  },
  pln: {
    name: 'Token Listrik PLN',
    label: 'Token PLN',
    inputLabel: 'Nomor Meter / ID Pelanggan PLN',
    inputPlaceholder: '14xxxxxxxxxx / 5xxxxxxxxxxx',
    helperText: '20 Digit stroom token otomatis muncul di layar dan tersimpan di riwayat.',
  },
  ewallet: {
    name: 'Top Up E-Wallet',
    label: 'E-Wallet',
    inputLabel: 'Nomor Ponsel Akun E-Wallet',
    inputPlaceholder: '08xxxxxxxxxx',
    helperText: 'Saldo masuk otomatis ke akun tujuan dalam hitungan detik tanpa biaya admin.',
  },
  tagihan: {
    name: 'Tagihan Rutin & Bulanan',
    label: 'Tagihan Rutin',
    inputLabel: 'Nomor Pelanggan / ID Tagihan',
    inputPlaceholder: 'Masukkan nomor kontrak / ID tagihan...',
    helperText: 'Periksa kembali data nama dan tagihan pokok sebelum menyelesaikan pembayaran.',
  },
};

// Operator telekomunikasi memakai nama operator resmi (dipakai untuk Pulsa & Paket Data)
const TELCO_PROVIDERS: ProviderItem[] = [
  { id: 'telkomsel', name: 'Telkomsel', code: 'TSEL', shortName: 'T', bgColor: '#F2352B', textColor: '#FFFFFF' },
  { id: 'indosat', name: 'Indosat', code: 'ISAT', shortName: 'ISAT', bgColor: '#F59E0B', textColor: '#FFFFFF' },
  { id: 'xl', name: 'XL Axiata', code: 'XL', shortName: 'XL', bgColor: '#245BE8', textColor: '#FFFFFF' },
  { id: 'tri', name: 'Tri', code: 'TRI', shortName: '3', bgColor: '#111827', textColor: '#FFFFFF' },
  { id: 'smartfren', name: 'Smartfren', code: 'SF', shortName: 'SF', bgColor: '#E11D48', textColor: '#FFFFFF' },
];

export const PROVIDERS_BY_CATEGORY: Record<ProductCategory, ProviderItem[]> = {
  pulsa: [...TELCO_PROVIDERS],
  data: [...TELCO_PROVIDERS],
  pln: [
    { id: 'pln-prabayar', name: 'PLN Prabayar', code: 'PLN_PRA', shortName: '⚡', bgColor: '#245BE8', textColor: '#FFE78F' },
    { id: 'pln-pascabayar', name: 'PLN Pascabayar', code: 'PLN_PASCA', shortName: '💡', bgColor: '#111827', textColor: '#FFFFFF' },
  ],
  ewallet: [
    { id: 'gopay', name: 'GoPay', code: 'GOPAY', shortName: 'G', bgColor: '#00AED6', textColor: '#FFFFFF' },
    { id: 'dana', name: 'DANA', code: 'DANA', shortName: 'D', bgColor: '#118EEA', textColor: '#FFFFFF' },
    { id: 'ovo', name: 'OVO', code: 'OVO', shortName: 'O', bgColor: '#4C3494', textColor: '#FFFFFF' },
    { id: 'shopeepay', name: 'ShopeePay', code: 'SPAY', shortName: 'S', bgColor: '#EE4D2D', textColor: '#FFFFFF' },
    { id: 'linkaja', name: 'LinkAja', code: 'LINK', shortName: 'LA', bgColor: '#ED1C24', textColor: '#FFFFFF' },
  ],
  tagihan: [
    { id: 'bpjs', name: 'BPJS Kesehatan', code: 'BPJS', shortName: 'BPJS', bgColor: '#059669', textColor: '#FFFFFF' },
    { id: 'pdam', name: 'PDAM', code: 'PDAM', shortName: 'PDAM', bgColor: '#0284C7', textColor: '#FFFFFF' },
    { id: 'indihome', name: 'IndiHome', code: 'INDI', shortName: 'INDI', bgColor: '#DC2626', textColor: '#FFFFFF' },
    { id: 'multifinance', name: 'Multifinance', code: 'FIN', shortName: 'FIN', bgColor: '#4B5563', textColor: '#FFFFFF' },
  ],
};

export const NOMINALS_BY_CATEGORY: Record<ProductCategory, NominalItem[]> = {
  pulsa: [
    { id: 'p5', label: '5.000', description: 'Aktif +3 hari', price: 6000 },
    { id: 'p10', label: '10.000', description: 'Aktif +7 hari', price: 11000 },
    { id: 'p15', label: '15.000', description: 'Aktif +15 hari', price: 16000 },
    { id: 'p20', label: '20.000', description: 'Aktif +20 hari', price: 20800 },
    { id: 'p25', label: '25.000', description: 'Aktif +30 hari', price: 25750, badge: 'POPULER' },
    { id: 'p50', label: '50.000', description: 'Aktif +45 hari', price: 50500 },
    { id: 'p100', label: '100.000', description: 'Aktif +60 hari', price: 99500, badge: 'HEMAT' },
    { id: 'p200', label: '200.000', description: 'Aktif +90 hari', price: 198500 },
  ],
  data: [
    { id: 'd1', label: '3 GB / 30 Hari', description: 'Reguler semua jaringan 24 jam', price: 18500 },
    { id: 'd2', label: '7 GB / 30 Hari', description: 'Internet utama + YouTube', price: 32000 },
    { id: 'd3', label: '14 GB / 30 Hari', description: 'Tanpa batas kuota aplikasi', price: 54000, badge: 'POPULER' },
    { id: 'd4', label: '25 GB / 30 Hari', description: 'Full 24 jam sepuasnya', price: 79000 },
    { id: 'd5', label: '50 GB / 30 Hari', description: 'Termasuk langganan streaming', price: 125000, badge: 'HEMAT' },
    { id: 'd6', label: 'Unlimited / 30 Hari', description: 'FUP harian tanpa putus', price: 98000 },
  ],
  pln: [
    { id: 'pln20', label: '20.000', description: 'Stroom ~13.5 kWh', price: 22500 },
    { id: 'pln50', label: '50.000', description: 'Stroom ~34.0 kWh', price: 52500 },
    { id: 'pln100', label: '100.000', description: 'Stroom ~69.2 kWh', price: 102500, badge: 'POPULER' },
    { id: 'pln200', label: '200.000', description: 'Stroom ~138.8 kWh', price: 202500 },
    { id: 'pln500', label: '500.000', description: 'Stroom ~348.0 kWh', price: 502500, badge: 'HEMAT' },
    { id: 'pln1000', label: '1.000.000', description: 'Stroom ~698.0 kWh', price: 1002500 },
  ],
  ewallet: [
    { id: 'ew20', label: '20.000', description: 'Masuk penuh tanpa potongan', price: 20500 },
    { id: 'ew50', label: '50.000', description: 'Masuk penuh tanpa potongan', price: 50500, badge: 'POPULER' },
    { id: 'ew100', label: '100.000', description: 'Masuk penuh tanpa potongan', price: 100500 },
    { id: 'ew200', label: '200.000', description: 'Masuk penuh tanpa potongan', price: 200500 },
    { id: 'ew300', label: '300.000', description: 'Masuk penuh tanpa potongan', price: 300500 },
    { id: 'ew500', label: '500.000', description: 'Masuk penuh tanpa potongan', price: 500500, badge: 'HEMAT' },
  ],
  tagihan: [
    { id: 'tag1', label: 'Cek & Bayar Tagihan', description: 'Sistem cek inquiry realtime', price: 75000, badge: 'POPULER' },
    { id: 'tag2', label: 'Tagihan 1 Bulan', description: 'Periode berjalan saat ini', price: 125000 },
    { id: 'tag3', label: 'Tagihan 2 Bulan', description: 'Periode akumulatif', price: 250000 },
  ],
};

export function detectProviderFromPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (!clean || clean.length < 4) return 'Telkomsel';

  if (
    clean.startsWith('0811') ||
    clean.startsWith('0812') ||
    clean.startsWith('0813') ||
    clean.startsWith('0821') ||
    clean.startsWith('0822') ||
    clean.startsWith('0823') ||
    clean.startsWith('0851') ||
    clean.startsWith('0852') ||
    clean.startsWith('0853')
  ) {
    return 'Telkomsel';
  }

  if (
    clean.startsWith('0814') ||
    clean.startsWith('0815') ||
    clean.startsWith('0816') ||
    clean.startsWith('0855') ||
    clean.startsWith('0856') ||
    clean.startsWith('0857') ||
    clean.startsWith('0858')
  ) {
    return 'Indosat';
  }

  if (
    clean.startsWith('0817') ||
    clean.startsWith('0818') ||
    clean.startsWith('0819') ||
    clean.startsWith('0859') ||
    clean.startsWith('0877') ||
    clean.startsWith('0878')
  ) {
    return 'XL Axiata';
  }

  if (
    clean.startsWith('0895') ||
    clean.startsWith('0896') ||
    clean.startsWith('0897') ||
    clean.startsWith('0898') ||
    clean.startsWith('0899')
  ) {
    return 'Tri';
  }

  if (
    clean.startsWith('0881') ||
    clean.startsWith('0882') ||
    clean.startsWith('0883') ||
    clean.startsWith('0884') ||
    clean.startsWith('0885') ||
    clean.startsWith('0886') ||
    clean.startsWith('0887') ||
    clean.startsWith('0888') ||
    clean.startsWith('0889')
  ) {
    return 'Smartfren';
  }

  return 'Telkomsel';
}

/**
 * Validasi nomor tujuan sebelum checkout, sesuai jenis layanan.
 * Mengembalikan pesan error, atau null jika valid.
 */
export function validateDestination(
  category: ProductCategory,
  value: string
): string | null {
  const clean = value.replace(/\D/g, '');

  if (!clean) {
    return 'Nomor tujuan belum diisi.';
  }

  if (category === 'pulsa' || category === 'data' || category === 'ewallet') {
    if (!clean.startsWith('08')) {
      return 'Nomor HP harus diawali 08.';
    }
    if (clean.length < 9 || clean.length > 13) {
      return 'Nomor HP tidak valid (9–13 digit).';
    }
    return null;
  }

  if (category === 'pln') {
    if (clean.length < 11 || clean.length > 12) {
      return 'Nomor meter / ID pelanggan PLN harus 11–12 digit.';
    }
    return null;
  }

  if (clean.length < 6) {
    return 'ID tagihan minimal 6 digit.';
  }

  return null;
}
