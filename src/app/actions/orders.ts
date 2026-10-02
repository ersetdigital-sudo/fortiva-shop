'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';
import { maskDestination, type VerificationResponse } from '@/services/orderService';
import { DEFAULT_WHATSAPP_CS } from '@/lib/catalog-types';
import { buildInvoiceNumber } from '@/lib/order-codes';
import { canRevealProduct, normalizeOrderStatus, type OrderStatus } from '@/lib/order-status';

/**
 * Server action untuk sisi toko publik.
 *
 * Tabel `orders` tidak punya policy SELECT untuk anon (data pribadi),
 * jadi pembuatan & pencarian pesanan WAJIB lewat sini memakai service role.
 *
 * PENTING: `placeOrder` TIDAK menandai transaksi berhasil. Aksi pelanggan
 * ("Saya Sudah Bayar") hanya melaporkan pembayaran, jadi statusnya
 * WAITING_VERIFICATION. Serial number / token baru diterbitkan admin setelah
 * dana benar-benar terverifikasi.
 */

export interface PlaceOrderInput {
  categorySlug: string;
  categoryName: string;
  providerName: string;
  nominalLabel: string;
  destination: string;
  totalPrice: number;
  adminFee: number;
}

export interface PlaceOrderResult {
  ok: boolean;
  invoiceNumber?: string;
  error?: string;
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  if (!input.destination?.trim()) {
    return { ok: false, error: 'Nomor tujuan belum diisi.' };
  }

  const price = Number(input.totalPrice);
  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, error: 'Total pembayaran tidak valid.' };
  }

  try {
    const supabase = createAdminClient();

    // Nomor invoice harus unik — coba beberapa kali kalau bentrok.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const invoiceNumber = buildInvoiceNumber();

      const { error } = await supabase.from('orders').insert({
        invoice_number: invoiceNumber,
        category_slug: input.categorySlug,
        category_name: input.categoryName,
        provider_name: input.providerName,
        nominal_label: input.nominalLabel,
        destination: input.destination.trim(),
        total_price: price,
        admin_fee: Number(input.adminFee) || 0,
        status: 'WAITING_VERIFICATION',
        // Serial & token sengaja kosong: belum ada verifikasi pembayaran.
        serial_number: null,
        token_pln: null,
        payment_reported_at: new Date().toISOString(),
        payment_method: 'QRIS Standar Nasional',
      });

      if (!error) {
        revalidatePath('/admin');
        revalidatePath('/admin/pesanan');
        return { ok: true, invoiceNumber };
      }

      // 23505 = unique_violation -> nomor invoice kebetulan sama, ulangi.
      if (error.code !== '23505') {
        return { ok: false, error: error.message };
      }
    }

    return { ok: false, error: 'Gagal membuat nomor invoice unik. Coba lagi.' };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Gagal menyimpan pesanan.',
    };
  }
}

const NOT_FOUND_MESSAGE =
  'Pesanan tidak ditemukan atau data verifikasi tidak cocok. Pastikan nomor invoice dan nomor tujuan sudah sesuai.';

export async function lookupOrder(
  invoiceNumber: string,
  destinationNumber: string
): Promise<VerificationResponse> {
  const invoice = invoiceNumber.trim().toUpperCase();
  const destination = destinationNumber.replace(/\D/g, '').trim();

  if (!invoice) {
    return { success: false, error: 'Nomor invoice wajib diisi.' };
  }

  if (!destination || destination.length < 4) {
    return {
      success: false,
      error: 'Masukkan nomor HP atau nomor meter tujuan (minimal 4 digit) untuk verifikasi.',
    };
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('orders')
      .select(
        'invoice_number, category_name, provider_name, nominal_label, destination, total_price, status, serial_number, token_pln, customer_note, payment_method, created_at'
      )
      .ilike('invoice_number', invoice)
      .maybeSingle();

    if (error || !data) {
      return { success: false, error: NOT_FOUND_MESSAGE };
    }

    const storedDestination = String(data.destination ?? '').replace(/\D/g, '');
    const isMatch =
      storedDestination === destination ||
      storedDestination.endsWith(destination) ||
      destination.endsWith(storedDestination);

    // Pesan error sengaja disamakan supaya nomor invoice tidak bisa ditebak orang lain.
    if (!isMatch) {
      return { success: false, error: NOT_FOUND_MESSAGE };
    }

    const status = normalizeOrderStatus(data.status);
    const whatsappNumber = await resolveWhatsappNumber(supabase);
    const supportMessage = encodeURIComponent(
      `Halo CS Fortiva Shop, saya ingin menanyakan status pesanan saya dengan nomor invoice ${data.invoice_number}.`
    );

    // Serial / token disembunyikan selama pembayaran belum terverifikasi.
    const revealProduct = canRevealProduct(status);

    return {
      success: true,
      data: {
        invoiceNumber: String(data.invoice_number),
        categoryName: String(data.category_name ?? ''),
        providerName: String(data.provider_name ?? ''),
        nominalLabel: String(data.nominal_label ?? ''),
        maskedDestination: maskDestination(String(data.destination ?? '')),
        totalPrice: Number(data.total_price ?? 0),
        paymentMethod: String(data.payment_method ?? 'QRIS Standar Nasional'),
        status,
        createdAt: String(data.created_at ?? ''),
        serialNumber:
          revealProduct && data.serial_number ? String(data.serial_number) : undefined,
        tokenPln: revealProduct && data.token_pln ? String(data.token_pln) : undefined,
        customerNote: data.customer_note ? String(data.customer_note) : undefined,
        supportLink: `https://wa.me/${whatsappNumber}?text=${supportMessage}`,
      },
    };
  } catch {
    return { success: false, error: 'Terjadi gangguan saat memverifikasi pesanan.' };
  }
}

export interface PaymentStatusSummary {
  found: boolean;
  invoiceNumber?: string;
  categoryName?: string;
  providerName?: string;
  nominalLabel?: string;
  totalPrice?: number;
  paymentMethod?: string;
  status?: OrderStatus;
  createdAt?: string;
  serialNumber?: string;
  tokenPln?: string;
  supportLink?: string;
}

/**
 * Ringkasan status untuk halaman /pembayaran/verifikasi/[invoice].
 * Tanpa nomor tujuan (dipakai hanya untuk menampilkan status, bukan data pribadi).
 */
export async function getPaymentStatus(invoiceNumber: string): Promise<PaymentStatusSummary> {
  const invoice = invoiceNumber.trim().toUpperCase();
  if (!invoice) return { found: false };

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('orders')
      .select(
        'invoice_number, category_name, provider_name, nominal_label, total_price, payment_method, status, serial_number, token_pln, created_at'
      )
      .ilike('invoice_number', invoice)
      .maybeSingle();

    if (error || !data) return { found: false };

    const status = normalizeOrderStatus(data.status);
    const revealProduct = canRevealProduct(status);
    const whatsappNumber = await resolveWhatsappNumber(supabase);
    const supportMessage = encodeURIComponent(
      `Halo CS Fortiva Shop, saya ingin menanyakan status pembayaran invoice ${data.invoice_number}.`
    );

    return {
      found: true,
      invoiceNumber: String(data.invoice_number),
      categoryName: String(data.category_name ?? ''),
      providerName: String(data.provider_name ?? ''),
      nominalLabel: String(data.nominal_label ?? ''),
      totalPrice: Number(data.total_price ?? 0),
      paymentMethod: String(data.payment_method ?? 'QRIS Standar Nasional'),
      status,
      createdAt: String(data.created_at ?? ''),
      serialNumber: revealProduct && data.serial_number ? String(data.serial_number) : undefined,
      tokenPln: revealProduct && data.token_pln ? String(data.token_pln) : undefined,
      supportLink: `https://wa.me/${whatsappNumber}?text=${supportMessage}`,
    };
  } catch {
    return { found: false };
  }
}

/** Nomor CS diambil dari tabel `settings` supaya ikut berubah saat diubah admin. */
async function resolveWhatsappNumber(
  supabase: ReturnType<typeof createAdminClient>
): Promise<string> {
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'whatsapp_cs')
    .maybeSingle();

  return (data?.value || DEFAULT_WHATSAPP_CS).replace(/\D/g, '');
}
