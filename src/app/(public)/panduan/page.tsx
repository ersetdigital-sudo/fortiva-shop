import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PanduanPage } from '../../../views/PanduanPage';

export const dynamic = 'force-dynamic';

// Alias route for /panduan (same content as /panduan-qris).
// Judul sengaja dibedakan agar tidak ada dua halaman dengan title identik.
export const metadata: Metadata = {
  title: 'Panduan Transaksi | Fortiva Shop',
  description:
    'Panduan transaksi produk digital Fortiva Shop, mulai dari memilih produk sampai pembayaran QRIS.',
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PanduanPage />
    </Suspense>
  );
}
