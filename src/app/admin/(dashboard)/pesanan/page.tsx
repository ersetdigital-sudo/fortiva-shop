import { createAdminClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/admin/ui';
import { OrdersClient, type OrderRow } from '@/components/admin/OrdersClient';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const { data } = await createAdminClient()
    .from('orders')
    .select(
      'id, invoice_number, category_name, provider_name, nominal_label, destination, total_price, admin_fee, status, serial_number, token_pln, customer_note, payment_method, created_at'
    )
    .order('created_at', { ascending: false })
    .limit(300);

  const orders = (data ?? []) as OrderRow[];

  return (
    <>
      <PageHeader title="Pesanan" description="Kelola dan proses seluruh transaksi Fortiva" />
      <OrdersClient initialOrders={orders} />
    </>
  );
}
