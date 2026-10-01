import { Suspense } from 'react';
import { PanduanPage } from '../../views/PanduanPage';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PanduanPage />
    </Suspense>
  );
}
