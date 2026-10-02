import { createAdminClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/admin/ui';
import {
  ProductsClient,
  type CategoryOption,
  type ProductRow,
  type ProviderOption,
} from '@/components/admin/ProductsClient';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const supabase = createAdminClient();

  const [{ data: products }, { data: categories }, { data: providers }] = await Promise.all([
    supabase
      .from('products')
      .select('id, category_slug, provider_code, label, description, price, badge, image_url, sort_order, is_active')
      .order('category_slug', { ascending: true })
      .order('sort_order', { ascending: true }),
    supabase.from('categories').select('slug, label').order('sort_order', { ascending: true }),
    supabase
      .from('providers')
      .select('id, category_slug, code, name')
      .order('sort_order', { ascending: true }),
  ]);

  return (
    <>
      <PageHeader
        title="Produk & Nominal"
        description="Atur nominal, harga jual, badge, dan gambar produk yang tampil di halaman toko."
      />
      <ProductsClient
        initialProducts={(products ?? []) as ProductRow[]}
        categories={(categories ?? []) as CategoryOption[]}
        providers={(providers ?? []) as ProviderOption[]}
      />
    </>
  );
}
