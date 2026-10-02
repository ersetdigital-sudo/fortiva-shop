import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SyaratKetentuanPage } from '../../../views/SyaratKetentuanPage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan | Fortiva Shop',
  description:
    'Ketentuan penggunaan layanan Fortiva Shop untuk pembelian produk digital dan pembayaran QRIS.',
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SyaratKetentuanPage />
    </Suspense>
  );
}
