/**
 * Tipe & util pesanan yang aman dipakai di client.
 *
 * Penyimpanan dan verifikasi pesanan ditangani server action
 * (`src/app/actions/orders.ts`) yang bicara langsung ke Supabase.
 * Tabel `orders` sengaja TIDAK bisa dibaca publik lewat RLS.
 */

import type { OrderStatus } from '../lib/order-status';

export interface VerifiedOrderDetail {
  invoiceNumber: string;
  categoryName: string;
  providerName: string;
  nominalLabel: string;
  maskedDestination: string;
  totalPrice: number;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  /** Terisi hanya saat status sudah VERIFIED/PROCESSING/SUCCESS. */
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

/** Masking nomor tujuan, mis. 0812 •••• 7890. */
export function maskDestination(dest: string): string {
  const clean = dest.trim();
  if (clean.length <= 4) return '••••';
  const prefix = clean.slice(0, 4);
  const suffix = clean.slice(-4);
  return `${prefix} •••• ${suffix}`;
}
