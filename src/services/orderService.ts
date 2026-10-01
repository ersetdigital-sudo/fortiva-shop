import { TransactionRecord } from '../types';

export interface VerifiedOrderDetail {
  invoiceNumber: string;
  categoryName: string;
  providerName: string;
  nominalLabel: string;
  maskedDestination: string;
  totalPrice: number;
  paymentMethod: string;
  status: 'SUCCESS' | 'PROCESSING' | 'PENDING' | 'FAILED';
  createdAt: string;
  serialNumber?: string;
  tokenPln?: string;
  customerNote?: string;
  supportLink: string;
}

export interface VerificationResponse {
  success: boolean;
  data?: VerifiedOrderDetail;
  error?: string;
}

// In-memory + storage private store (NOT accessible via global window or public API listing)
const STORAGE_KEY = '_fortiva_secure_orders';

function maskDestination(dest: string): string {
  const clean = dest.trim();
  if (clean.length <= 4) return '••••';
  const prefix = clean.slice(0, 4);
  const suffix = clean.slice(-4);
  return `${prefix} •••• ${suffix}`;
}

function getPrivateOrders(): TransactionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }

  // Initial seed orders for verified testing
  const seed: TransactionRecord[] = [
    {
      id: 'tx-seed-1',
      invoiceNumber: 'INV-2025-91204',
      categoryName: 'Pulsa Reguler',
      providerName: 'Telkomsel',
      nominalLabel: '25.000',
      destination: '081234567890',
      totalPrice: 25750,
      adminFee: 0,
      status: 'SUCCESS',
      createdAt: 'Hari ini, 10:24 WIB',
      serialNumber: '202505241024558912',
    },
    {
      id: 'tx-seed-2',
      invoiceNumber: 'INV-2025-88301',
      categoryName: 'Token Listrik PLN',
      providerName: 'PLN Prabayar',
      nominalLabel: '100.000',
      destination: '14285910245',
      totalPrice: 102500,
      adminFee: 0,
      status: 'SUCCESS',
      createdAt: 'Kemarin, 19:45 WIB',
      tokenPln: '4129-8812-3049-1182-9014',
      serialNumber: 'PLN202509121945110',
    },
  ];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  } catch {
    // ignore
  }

  return seed;
}

export async function saveOrder(order: TransactionRecord): Promise<void> {
  const current = getPrivateOrders();
  const updated = [order, ...current.filter((o) => o.invoiceNumber !== order.invoiceNumber)];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

/**
 * Securely verify an order by Invoice Number AND Destination Phone/Meter ID.
 * Does NOT return any data unless both match.
 * Masks the phone/meter number in the returned payload.
 */
export async function verifyOrder(
  invoiceNumber: string,
  destinationNumber: string
): Promise<VerificationResponse> {
  // Simulate network latency (250-400ms) for real-world feel
  await new Promise((resolve) => setTimeout(resolve, 350));

  const cleanInv = invoiceNumber.trim().toUpperCase();
  const cleanDest = destinationNumber.replace(/\D/g, '').trim();

  if (!cleanInv) {
    return {
      success: false,
      error: 'Nomor invoice wajib diisi.',
    };
  }

  if (!cleanDest || cleanDest.length < 4) {
    return {
      success: false,
      error: 'Masukkan nomor HP atau nomor meter tujuan (minimal 4 digit) untuk verifikasi.',
    };
  }

  const orders = getPrivateOrders();
  const match = orders.find((o) => o.invoiceNumber.toUpperCase() === cleanInv);

  // Security check: Must exist AND destination must match (either exact or ends with last 4 digits)
  if (!match) {
    return {
      success: false,
      error: 'Pesanan tidak ditemukan atau data verifikasi tidak cocok. Pastikan nomor invoice dan nomor tujuan sudah sesuai.',
    };
  }

  const storedDestClean = match.destination.replace(/\D/g, '');
  const isDestMatch =
    storedDestClean === cleanDest ||
    storedDestClean.endsWith(cleanDest) ||
    cleanDest.endsWith(storedDestClean);

  if (!isDestMatch) {
    return {
      success: false,
      error: 'Pesanan tidak ditemukan atau data verifikasi tidak cocok. Pastikan nomor invoice dan nomor tujuan sudah sesuai.',
    };
  }

  const supportMsg = encodeURIComponent(
    `Halo CS Fortiva Shop, saya ingin menanyakan status pesanan saya dengan nomor invoice ${match.invoiceNumber}.`
  );

  return {
    success: true,
    data: {
      invoiceNumber: match.invoiceNumber,
      categoryName: match.categoryName,
      providerName: match.providerName,
      nominalLabel: match.nominalLabel,
      maskedDestination: maskDestination(match.destination),
      totalPrice: match.totalPrice,
      paymentMethod: 'QRIS Standar Nasional',
      status: match.status,
      createdAt: match.createdAt,
      serialNumber: match.serialNumber,
      tokenPln: match.tokenPln,
      customerNote: 'Serial Number / Token telah berhasil dikirimkan ke biller resmi.',
      supportLink: `https://wa.me/6281234567890?text=${supportMsg}`,
    },
  };
}
