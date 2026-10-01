import { Suspense } from 'react';
import { BantuanPage } from '../../views/BantuanPage';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BantuanPage />
    </Suspense>
  );
}
