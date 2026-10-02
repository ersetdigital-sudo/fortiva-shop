import { Suspense } from 'react';
import { SyaratKetentuanPage } from '../../../views/SyaratKetentuanPage';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SyaratKetentuanPage />
    </Suspense>
  );
}
