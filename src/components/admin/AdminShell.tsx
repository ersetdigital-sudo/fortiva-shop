'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminDrawer, AdminSidebar } from './AdminSidebar';
import { AdminUserMenu } from './AdminUserMenu';
import { IconBolt, IconMenu } from './icons';

type AdminShellProps = {
  email: string;
  fullName?: string;
  children: React.ReactNode;
};

/**
 * Shell panel admin: sidebar desktop + header + drawer navigasi mobile.
 * State drawer dimiliki di sini agar tombol hamburger pada header dan
 * drawer merupakan satu sistem navigasi (bukan tombol floating).
 */
export function AdminShell({ email, fullName, children }: AdminShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // Tutup drawer setiap berpindah halaman
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Tutup drawer saat layar melebar ke breakpoint desktop
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const onChange = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener('change', onChange);
    return () => desktop.removeEventListener('change', onChange);
  }, []);

  // Escape untuk menutup + kunci scroll body selama drawer terbuka
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // Kembalikan fokus ke tombol hamburger setelah drawer ditutup
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return;
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      toggleRef.current?.focus();
    }
  }, [open]);

  return (
    <div className="flex min-h-screen bg-[#F7F6F2] text-[#111827]">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[#E5E3DC] bg-[#F7F6F2]/90 px-4 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)] backdrop-blur sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            {/* Hamburger (mobile & tablet) — ada di header, bukan floating */}
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              aria-label="Buka menu navigasi"
              aria-expanded={open}
              aria-controls="admin-mobile-nav"
              className="-ml-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E5E3DC] bg-white text-[#111827] transition hover:border-[#F2352B]/40 hover:text-[#F2352B] lg:hidden"
            >
              <IconMenu className="h-5 w-5" />
            </button>

            {/* Brand mobile: [☰] Fortiva */}
            <div className="flex min-w-0 items-center gap-2 lg:hidden">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F2352B] text-white">
                <IconBolt className="h-4 w-4" />
              </span>
              <span className="truncate text-[15px] font-extrabold tracking-[-0.01em] text-[#111827]">
                Fortiva
              </span>
            </div>

            {/* Judul desktop */}
            <div className="hidden min-w-0 lg:block">
              <p className="truncate text-[13px] font-bold text-[#111827]">Panel Admin Fortiva</p>
              <p className="truncate text-[11px] text-[#6B7280]">
                Kelola katalog, pesanan, dan pengaturan toko
              </p>
            </div>
          </div>

          <AdminUserMenu email={email} fullName={fullName} />
        </header>

        <main className="flex-1 px-4 py-6 pb-12 sm:px-6 lg:pb-14">{children}</main>
      </div>

      <AdminDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
