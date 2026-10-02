import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PanduanPage } from '../../../views/PanduanPage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Panduan Pembayaran QRIS | Fortiva Shop',
  description:
    'Panduan lengkap melakukan pembayaran produk digital Fortiva Shop menggunakan QRIS.',
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PanduanPage />
    </Suspense>
  );
}
