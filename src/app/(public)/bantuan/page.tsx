import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BantuanPage } from '../../../views/BantuanPage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pusat Bantuan & FAQ | Fortiva Shop',
  description:
    'Temukan jawaban seputar pembelian produk digital dan pembayaran QRIS, atau hubungi tim Fortiva Shop melalui WhatsApp untuk pertanyaan transaksi.',
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BantuanPage />
    </Suspense>
  );
}
