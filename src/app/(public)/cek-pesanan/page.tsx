import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CekPesananPage } from '../../../views/CekPesananPage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cek Pesanan | Fortiva Shop',
  description: 'Cek status transaksi Fortiva Shop menggunakan nomor invoice.',
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CekPesananPage />
    </Suspense>
  );
}
