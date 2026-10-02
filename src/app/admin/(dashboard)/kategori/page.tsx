import { createAdminClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/admin/ui';
import {
  CategoriesClient,
  type CategoryRow,
  type ProviderRow,
} from '@/components/admin/CategoriesClient';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const supabase = createAdminClient();

  const [{ data: categories }, { data: providers }] = await Promise.all([
    supabase
      .from('categories')
      .select(
        'id, slug, name, label, input_label, input_placeholder, helper_text, image_url, sort_order, is_active'
      )
      .order('sort_order', { ascending: true }),
    supabase
      .from('providers')
      .select(
        'id, category_slug, name, code, short_name, bg_color, text_color, logo_url, sort_order, is_active'
      )
      .order('category_slug', { ascending: true })
      .order('sort_order', { ascending: true }),
  ]);

  return (
    <>
      <PageHeader
        title="Kategori & Provider"
        description="Kelola layanan yang tampil di toko beserta operator dan warnanya."
      />
      <CategoriesClient
        initialCategories={(categories ?? []) as CategoryRow[]}
        initialProviders={(providers ?? []) as ProviderRow[]}
      />
    </>
  );
}
