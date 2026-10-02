import { createAdminClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/admin/ui';
import {
  SettingsClient,
  type BankAccountRow,
  type SettingRow,
} from '@/components/admin/SettingsClient';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const supabase = createAdminClient();

  const [{ data: settings }, { data: bankAccounts }] = await Promise.all([
    supabase
      .from('settings')
      .select('key, value, label, group_name, sort_order')
      .order('group_name', { ascending: true })
      .order('sort_order', { ascending: true }),
    supabase
      .from('bank_accounts')
      .select('id, bank_name, account_number, account_name, logo_url, sort_order, is_active')
      .order('sort_order', { ascending: true }),
  ]);

  return (
    <>
      <PageHeader
        title="Pengaturan"
        description="Kelola identitas toko, nomor WhatsApp CS, gambar QRIS, dan rekening bank."
      />
      <SettingsClient
        initialSettings={(settings ?? []) as SettingRow[]}
        initialBankAccounts={(bankAccounts ?? []) as BankAccountRow[]}
      />
    </>
  );
}
