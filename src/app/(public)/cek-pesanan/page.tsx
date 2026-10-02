import { Suspense } from 'react';
import { CekPesananPage } from '../../../views/CekPesananPage';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CekPesananPage />
    </Suspense>
  );
}
