import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminUserMenu } from '@/components/admin/AdminUserMenu';

export const metadata: Metadata = {
  title: 'Panel Admin · Fortiva Shop',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();

  if (!admin) {
    redirect('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-[#F7F6F2] text-[#111827]">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[#E5E3DC] bg-[#F7F6F2]/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-[#111827]">Panel Admin Fortiva</p>
            <p className="truncate text-[11px] text-[#6B7280]">
              Kelola katalog, pesanan, dan pengaturan toko
            </p>
          </div>
          <AdminUserMenu email={admin.email} fullName={admin.fullName} />
        </header>

        <main className="flex-1 px-4 py-6 pb-24 sm:px-6 lg:pb-10">{children}</main>
      </div>
    </div>
  );
}
