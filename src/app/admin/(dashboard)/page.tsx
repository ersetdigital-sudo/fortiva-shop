import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';
import { Card, EmptyState, PageHeader, StatCard, StatusBadge, Badge } from '@/components/admin/ui';
import { IconReceipt } from '@/components/admin/icons';
import { formatDateTime, formatNumber, formatRupiah } from '@/lib/format';

export const dynamic = 'force-dynamic';

interface DashboardStats {
  orders_total: number;
  orders_today: number;
  /** Belum dibayar + sudah dilaporkan tapi belum diverifikasi. */
  orders_pending: number;
  orders_waiting_verification: number;
  orders_verified: number;
  orders_processing: number;
  orders_failed: number;
  orders_success: number;
  revenue_total: number;
  revenue_today: number;
  products_active: number;
  products_total: number;
  categories_active: number;
  providers_active: number;
  bank_accounts_active: number;
}

interface RecentOrder {
  id: string;
  invoice_number: string;
  category_name: string;
  provider_name: string;
  nominal_label: string;
  total_price: number | string;
  status: string;
  created_at: string;
}

const DEFAULT_STATS: DashboardStats = {
  orders_total: 0,
  orders_today: 0,
  orders_pending: 0,
  orders_waiting_verification: 0,
  orders_verified: 0,
  orders_processing: 0,
  orders_failed: 0,
  orders_success: 0,
  revenue_total: 0,
  revenue_today: 0,
  products_active: 0,
  products_total: 0,
  categories_active: 0,
  providers_active: 0,
  bank_accounts_active: 0,
};

export default async function AdminOverviewPage() {
  const supabase = createAdminClient();

  const [{ data: statsData }, { data: recentOrders }] = await Promise.all([
    supabase.rpc('admin_dashboard_stats'),
    supabase
      .from('orders')
      .select('id, invoice_number, category_name, provider_name, nominal_label, total_price, status, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  const stats: DashboardStats = { ...DEFAULT_STATS, ...((statsData as DashboardStats | null) ?? {}) };
  const orders = (recentOrders ?? []) as RecentOrder[];

  return (
    <>
      <PageHeader
        title="Ringkasan"
        description="Pantau performa toko, pesanan terbaru, dan kesehatan katalog."
        action={
          <Link
            href="/admin/pesanan"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#F2352B] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#DC2626]"
          >
            Kelola Pesanan
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pendapatan (Sukses)"
          value={formatRupiah(stats.revenue_total)}
          hint={`Hari ini ${formatRupiah(stats.revenue_today)}`}
          accent="green"
        />
        <StatCard
          label="Total Pesanan"
          value={formatNumber(stats.orders_total)}
          hint={`${formatNumber(stats.orders_today)} pesanan hari ini`}
          accent="blue"
        />
        <StatCard
          label="Perlu Ditindak"
          value={formatNumber(stats.orders_pending + stats.orders_verified)}
          hint={`${formatNumber(stats.orders_waiting_verification)} menunggu verifikasi · ${formatNumber(stats.orders_verified)} siap diproses`}
          accent="red"
        />
        <StatCard
          label="Produk Aktif"
          value={formatNumber(stats.products_active)}
          hint={`dari ${formatNumber(stats.products_total)} produk`}
          accent="yellow"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Kategori Aktif"
          value={formatNumber(stats.categories_active)}
          accent="neutral"
        />
        <StatCard
          label="Provider Aktif"
          value={formatNumber(stats.providers_active)}
          accent="neutral"
        />
        <StatCard
          label="Rekening Aktif"
          value={formatNumber(stats.bank_accounts_active)}
          accent="neutral"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card
          title="Status Pesanan"
          description="Distribusi seluruh pesanan"
          className="lg:col-span-1"
        >
          <ul className="flex flex-col gap-3">
            {[
              { label: 'Sukses', value: stats.orders_success, tone: 'green' as const },
              { label: 'Menunggu Verifikasi', value: stats.orders_waiting_verification, tone: 'yellow' as const },
              { label: 'Terverifikasi', value: stats.orders_verified, tone: 'blue' as const },
              { label: 'Diproses', value: stats.orders_processing, tone: 'blue' as const },
              { label: 'Gagal / Kedaluwarsa', value: stats.orders_failed, tone: 'red' as const },
            ].map((item) => {
              const total = Math.max(stats.orders_total, 1);
              const percent = Math.round((item.value / total) * 100);
              return (
                <li key={item.label}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <Badge tone={item.tone}>{item.label}</Badge>
                    <span className="num-tabular text-[12px] font-semibold text-[#111827]">
                      {formatNumber(item.value)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
                    <div
                      className="h-full rounded-full bg-[#111827]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card
          title="Pesanan Terbaru"
          description="8 transaksi terakhir"
          className="lg:col-span-2"
          bodyClassName="p-0"
          action={
            <Link
              href="/admin/pesanan"
              className="text-[12px] font-semibold text-[#245BE8] hover:underline"
            >
              Lihat semua →
            </Link>
          }
        >
          {orders.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={<IconReceipt className="h-5 w-5" />}
                title="Belum ada pesanan"
                description="Pesanan dari halaman checkout akan muncul di sini secara otomatis."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#EFEDE7] text-[10px] uppercase tracking-[0.06em] text-[#6B7280]">
                    <th className="px-5 py-3 font-bold">Invoice</th>
                    <th className="px-5 py-3 font-bold">Produk</th>
                    <th className="px-5 py-3 text-right font-bold">Total</th>
                    <th className="px-5 py-3 font-bold">Status</th>
                    <th className="px-5 py-3 font-bold">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-[#F5F4F0] last:border-0 hover:bg-[#F7F6F2]"
                    >
                      <td className="px-5 py-3 font-mono text-[11px] font-semibold text-[#111827]">
                        {order.invoice_number}
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-[12px] font-semibold text-[#111827]">
                          {order.provider_name || order.category_name}
                        </p>
                        <p className="text-[11px] text-[#6B7280]">{order.nominal_label}</p>
                      </td>
                      <td className="num-tabular px-5 py-3 text-right text-[12px] font-semibold text-[#111827]">
                        {formatRupiah(order.total_price)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-3 text-[11px] text-[#6B7280]">
                        {formatDateTime(order.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
