'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconBolt,
  IconBox,
  IconClose,
  IconFolder,
  IconMenu,
  IconOverview,
  IconReceipt,
  IconSettings,
} from './icons';

const NAV_ITEMS: { href: string; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { href: '/admin', label: 'Ringkasan', Icon: IconOverview },
  { href: '/admin/pesanan', label: 'Pesanan', Icon: IconReceipt },
  { href: '/admin/produk', label: 'Produk & Nominal', Icon: IconBox },
  { href: '/admin/kategori', label: 'Kategori & Provider', Icon: IconFolder },
  { href: '/admin/pengaturan', label: 'Pengaturan', Icon: IconSettings },
];

export function AdminSidebar() {
  const pathname = usePathname() ?? '/admin';
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition ${
              active
                ? 'bg-[#F2352B] text-white shadow-[0_8px_20px_-8px_rgba(242,53,43,0.9)]'
                : 'text-white/65 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Tombol hamburger (mobile) */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#111827] text-white shadow-lg lg:hidden"
        aria-label="Buka menu admin"
      >
        {open ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
      </button>

      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col bg-[#111827] px-4 py-5 lg:flex">
        <SidebarBrand />
        <div className="mt-7 flex-1">{nav}</div>
        <SidebarFooter />
      </aside>

      {/* Sidebar mobile */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#111827] px-4 py-5 lg:hidden">
            <SidebarBrand />
            <div className="mt-7 flex-1">{nav}</div>
            <SidebarFooter />
          </aside>
        </>
      )}
    </>
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
