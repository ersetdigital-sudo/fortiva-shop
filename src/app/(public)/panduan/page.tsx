import { Suspense } from 'react';
import { PanduanPage } from '../../../views/PanduanPage';

export const dynamic = 'force-dynamic';

// Alias route for /panduan (same content as /panduan-qris)
export default function Page() {
  return (
    <Suspense fallback={null}>
      <PanduanPage />
    </Suspense>
  );
}
