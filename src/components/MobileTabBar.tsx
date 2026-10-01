'use client';

import React from 'react';
import { Link, useRouter } from '../router';

import { Icon, IconName } from './icons';

interface TabItem {
  label: string;
  href: string;
  icon: IconName;
  match: (path: string) => boolean;
}

const TABS: TabItem[] = [
  { label: 'Beranda', href: '/', icon: 'home', match: (p) => p === '/' },
  {
    label: 'Pesanan',
    href: '/cek-pesanan',
    icon: 'receipt_long',
    match: (p) => p === '/cek-pesanan',
  },
  {
    label: 'Panduan',
    href: '/panduan-qris',
    icon: 'menu_book',
    match: (p) => p === '/panduan-qris' || p === '/panduan',
  },
  {
    label: 'Bantuan',
    href: '/bantuan',
    icon: 'support_agent',
    match: (p) => p === '/bantuan',
  },
];

/**
 * Bottom tab bar khusus mobile — bikin nuansa seperti aplikasi native
 * (fixed, blur glass, safe-area aware, ikon filled saat aktif).
 */
export const MobileTabBar: React.FC = () => {
  const { path } = useRouter();

  return (
    <nav
      aria-label="Navigasi bawah"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/85 backdrop-blur-xl border-t border-stone-200/70 shadow-[0_-10px_30px_-16px_rgba(17,24,39,0.18)] pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-4">
        {TABS.map((tab) => {
          const active = tab.match(path);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className="flex w-full flex-col items-center justify-center gap-1 h-16 active:scale-[0.92] transition-transform"
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  name={tab.icon}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={`w-[23px] h-[23px] transition-colors ${
                    active ? 'text-brand-red' : 'text-stone-400'
                  }`}
                />
                <span
                  className={`text-[10px] tracking-tight leading-none transition-colors ${
                    active ? 'text-brand-red font-bold' : 'text-stone-500 font-semibold'
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
