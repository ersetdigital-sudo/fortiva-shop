import { Suspense } from 'react';
import { HomePage } from '../../views/HomePage';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HomePage />
    </Suspense>
  );
}
