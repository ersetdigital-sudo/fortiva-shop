import type { Metadata } from 'next';
import { Suspense } from 'react';
import { KebijakanPrivasiPage } from '../../../views/KebijakanPrivasiPage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi | Fortiva Shop',
  description:
    'Bagaimana Fortiva Shop mengumpulkan, menggunakan, dan melindungi data transaksi pengguna.',
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <KebijakanPrivasiPage />
    </Suspense>
  );
}
