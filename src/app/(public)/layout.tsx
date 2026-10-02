import { AppShell } from '@/components/AppShell';
import { CatalogProvider } from '@/lib/catalog-context';
import { loadCatalog } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

/**
 * Layout seluruh halaman TOKO (bukan panel admin).
 *
 * Katalog diambil dari Supabase sekali per request, lalu dibagikan ke
 * komponen client lewat CatalogProvider — sehingga hasil edit di panel
 * admin langsung terlihat di halaman toko.
 */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const catalog = await loadCatalog();

  return (
    <CatalogProvider catalog={catalog}>
      <AppShell>{children}</AppShell>
    </CatalogProvider>
  );
}
