import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { LoginForm } from '@/components/admin/LoginForm';
import { IconBolt } from '@/components/admin/icons';

export const metadata: Metadata = {
  title: 'Masuk Panel Admin · Fortiva Shop',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#111827] px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2352B] text-white">
            <IconBolt className="h-5 w-5" />
          </span>
          <span className="text-[17px] font-extrabold tracking-[-0.01em] text-white">
            Fortiva<span className="text-[#F2352B]">Admin</span>
          </span>
        </div>

        <div className="rounded-2xl border border-[#E5E3DC] bg-[#F7F6F2] p-6 shadow-xl">
          <h1 className="text-[18px] font-extrabold text-[#111827]">Masuk Panel Admin</h1>
          <p className="mt-1 mb-5 text-[12px] text-[#6B7280]">
            Kelola katalog, pesanan, QRIS, dan rekening toko.
          </p>

          <Suspense fallback={<p className="text-[12px] text-[#6B7280]">Memuat…</p>}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-5 text-center text-[12px] text-white/45">
          <Link href="/" className="font-semibold text-white/70 hover:text-white">
            ← Kembali ke toko
          </Link>
        </p>
      </div>
    </main>
  );
}
