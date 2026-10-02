'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';
import { maskDestination, type VerificationResponse } from '@/services/orderService';
import { DEFAULT_WHATSAPP_CS } from '@/lib/catalog-types';

/**
 * Server action untuk sisi toko publik.
 *
 * Tabel `orders` tidak punya policy SELECT untuk anon (data pribadi),
 * jadi pembuatan & pencarian pesanan WAJIB lewat sini memakai service role.
 * Verifikasi tetap menuntut kecocokan nomor invoice + nomor tujuan.
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
  serialNumber?: string;
  tokenPln?: string;
  error?: string;
}

/** Nomor invoice: INV-<tahun>-<5 digit>. */
function buildInvoiceNumber(): string {
  const year = new Date().getFullYear();
  return `INV-${year}-${Math.floor(10000 + Math.random() * 90000)}`;
}

/** Serial number: YYYYMMDDHHmm + 6 digit acak. */
function buildSerialNumber(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(
    now.getHours()
  )}${pad(now.getMinutes())}`;
  return `${stamp}${Math.floor(100000 + Math.random() * 900000)}`;
}

/** Token PLN 20 digit, dikelompokkan 5x4. */
function buildPlnToken(): string {
  return Array.from({ length: 5 }, () => Math.floor(1000 + Math.random() * 9000)).join('-');
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

    const serialNumber = buildSerialNumber();
    const tokenPln = input.categorySlug === 'pln' ? buildPlnToken() : null;

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
        status: 'SUCCESS',
        serial_number: serialNumber,
        token_pln: tokenPln,
        payment_method: 'QRIS Standar Nasional',
      });

      if (!error) {
        revalidatePath('/admin');
        revalidatePath('/admin/pesanan');
        return { ok: true, invoiceNumber, serialNumber, tokenPln: tokenPln ?? undefined };
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

  // Simulasi latensi jaringan agar terasa seperti verifikasi biller sungguhan.
  await new Promise((resolve) => setTimeout(resolve, 300));

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

    const status = String(data.status ?? 'PENDING').toUpperCase();
    const supportMessage = encodeURIComponent(
      `Halo CS Fortiva Shop, saya ingin menanyakan status pesanan saya dengan nomor invoice ${data.invoice_number}.`
    );

    // Nomor CS diambil dari tabel `settings` supaya ikut berubah saat diubah di panel admin.
    const { data: whatsappSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'whatsapp_cs')
      .maybeSingle();

    const whatsappNumber = (whatsappSetting?.value || DEFAULT_WHATSAPP_CS).replace(/\D/g, '');

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
        status:
          status === 'SUCCESS' || status === 'PROCESSING' || status === 'FAILED'
            ? status
            : 'PENDING',
        createdAt: String(data.created_at ?? ''),
        serialNumber: data.serial_number ? String(data.serial_number) : undefined,
        tokenPln: data.token_pln ? String(data.token_pln) : undefined,
        customerNote: data.customer_note
          ? String(data.customer_note)
          : 'Serial Number / Token telah berhasil dikirimkan ke biller resmi.',
        supportLink: `https://wa.me/${whatsappNumber}?text=${supportMessage}`,
      },
    };
  } catch {
    return { success: false, error: 'Terjadi gangguan saat memverifikasi pesanan.' };
  }
}

const NOT_FOUND_MESSAGE =
  'Pesanan tidak ditemukan atau data verifikasi tidak cocok. Pastikan nomor invoice dan nomor tujuan sudah sesuai.';
