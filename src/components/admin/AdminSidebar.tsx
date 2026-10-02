'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconBolt,
  IconBox,
  IconClose,
  IconFolder,
  IconOverview,
  IconReceipt,
  IconSettings,
} from './icons';

export const NAV_ITEMS: { href: string; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { href: '/admin', label: 'Ringkasan', Icon: IconOverview },
  { href: '/admin/pesanan', label: 'Pesanan', Icon: IconReceipt },
  { href: '/admin/produk', label: 'Produk & Nominal', Icon: IconBox },
  { href: '/admin/kategori', label: 'Kategori & Provider', Icon: IconFolder },
  { href: '/admin/pengaturan', label: 'Pengaturan', Icon: IconSettings },
];

const isActivePath = (pathname: string, href: string) =>
  href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

/**
 * Sidebar desktop — tetap tampil normal di sisi kiri (lg ke atas),
 * tanpa perubahan struktur.
 */
export function AdminSidebar() {
  const pathname = usePathname() ?? '/admin';

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-[#111827] px-4 py-5 lg:flex">
      <SidebarBrand />
      <div className="mt-7 flex-1">
        <SidebarNav pathname={pathname} />
      </div>
      <SidebarFooter />
    </aside>
  );
}

/**
 * Navigasi mobile — drawer yang slide-in dari kiri dengan backdrop tipis.
 * Menutup lewat tombol X, tap backdrop, Escape, atau pemilihan menu.
 */
export function AdminDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname() ?? '/admin';
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  return (
    <div
      id="admin-mobile-nav"
      className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
      inert={!open}
    >
      {/* Backdrop tipis di belakang drawer */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`absolute inset-0 bg-[#0B1220]/45 transition-opacity duration-300 ease-out ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panel drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigasi admin"
        className={`absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col bg-[#111827] px-4 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-[max(env(safe-area-inset-top),1.25rem)] shadow-[0_24px_60px_-24px_rgba(3,7,18,0.8)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <SidebarBrand />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Tutup menu navigasi"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>

        <div className="-mx-1 mt-6 flex-1 overflow-y-auto overscroll-contain px-1">
          <SidebarNav pathname={pathname} onNavigate={onClose} />
        </div>

        <SidebarFooter />
      </aside>
    </div>
  );
}

function SidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Navigasi admin" className="flex flex-col gap-1">
      <p className="px-3.5 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
        Menu
      </p>

      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = isActivePath(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] transition-colors ${
              active
                ? 'bg-white/[0.08] font-bold text-white'
                : 'font-semibold text-white/60 hover:bg-white/[0.05] hover:text-white'
            }`}
          >
            <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-[#F2352B]' : ''}`} />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBrand() {
  return (
    <div className="flex items-center gap-2.5 px-1.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F2352B] text-white">
        <IconBolt className="h-[18px] w-[18px]" />
      </span>
      <span className="text-[15px] font-extrabold tracking-[-0.01em] text-white">
        Fortiva<span className="text-[#F2352B]">Admin</span>
      </span>
    </div>
  );
}

function SidebarFooter() {
  return (
    <div className="mt-4 rounded-xl bg-white/5 px-3.5 py-3">
      <p className="text-[11px] font-semibold text-white/80">Panel Admin</p>
      <p className="mt-0.5 text-[10px] leading-relaxed text-white/45">
        Kelola katalog, pesanan, QRIS, dan rekening toko.
      </p>
      <Link
        href="/"
        className="mt-2 inline-block text-[11px] font-semibold text-[#FFE78F] hover:underline"
      >
        ← Lihat toko
      </Link>
    </div>
  );
}
