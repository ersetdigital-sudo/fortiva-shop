import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/supabase/server';
import { AdminShell } from '@/components/admin/AdminShell';

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
    <AdminShell email={admin.email} fullName={admin.fullName}>
      {children}
    </AdminShell>
  );
}
