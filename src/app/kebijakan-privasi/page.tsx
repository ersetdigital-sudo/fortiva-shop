import { Suspense } from 'react';
import { KebijakanPrivasiPage } from '../../views/KebijakanPrivasiPage';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <KebijakanPrivasiPage />
    </Suspense>
  );
}
