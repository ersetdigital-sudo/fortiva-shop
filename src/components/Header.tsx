'use client';


import React from 'react';
import { Link, useRouter } from '../router';
import { Logo } from './Logo';
import { Icon } from './icons';
import { useCatalog } from '../lib/catalog-context';
import { whatsappUrl } from '../lib/catalog-types';

interface HeaderProps {
  onOpenSearch: () => void;
  searchQuery: string;
}

export const CS_AVATAR_URL =
  'https://lh3.googleusercontent.com/aida/AEtjO1XrtgHfPmpcBlsfk9nBKkh7L53xBMkWNl5SjdSYpuKeKVqRpi0zvzpegSSOmQWJCSOYBOvjYk00SEouLs2dhY9VHsWRRSk5RqBtCnvM0ssf-nAn0iMPyzm5J2ogLIJpTWRy7R1Ep8lK273i5weEHdM6ThaRzsI5th4AuuzJzoLosTnycDw6MTvp5HSe8ioWtY9w78k1gur8dDutnDhDV6nMCKphuj8VkS8C51rdir79LOnJa6ePLj_BN4Y';

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  searchQuery,
}) => {
  const { path, navigate } = useRouter();
  const { settings } = useCatalog();

  const handleNavTerminal = (e: React.MouseEvent) => {
    e.preventDefault();
    if (path === '/') {
      const el = document.getElementById('terminal');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#terminal');
    }
  };

  const handleNavPromo = (e: React.MouseEvent) => {
    e.preventDefault();
    if (path === '/') {
      const el = document.getElementById('panduan');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#panduan');
    }
  };

  const isHome = path === '/';
  const isCekPesanan = path === '/cek-pesanan';

  return (
    <>
      {/* 1. COMPACT UTILITY BAR */}
      <div className="bg-[#111827] text-stone-300 text-[12px] border-b border-stone-800">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
          {/* Left: Status Indicator & Service Hours */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="font-semibold text-white tracking-tight">
              Layanan Digital Fortiva
            </span>
            <span className="text-stone-500 hidden sm:inline" aria-hidden="true">
              ·
            </span>
            <span className="text-stone-400 hidden sm:inline font-normal">
              CS WhatsApp · 08.00–22.00 WIB
            </span>
          </div>

          {/* Right: Essential Service Links */}
          <div className="hidden sm:flex items-center gap-3.5 text-stone-300 font-medium">
            <Link
              href="/panduan-qris"
              className="hover:text-white transition-colors"
            >
              Panduan Pembayaran
            </Link>
            <span className="text-stone-600" aria-hidden="true">
              ·
            </span>
            <Link
              href="/cek-pesanan"
              className="hover:text-white transition-colors"
            >
              Lacak Pesanan
            </Link>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY STICKY NAVIGATION */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl md:bg-white md:backdrop-blur-none border-b border-stone-200/90 shadow-[0_1px_3px_0_rgba(17,24,39,0.02)]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop & Tablet Row (Height 76px / Mobile 62px) */}
          <div className="h-[62px] md:h-[76px] flex items-center justify-between gap-3 md:gap-4 lg:gap-8">
            {/* ZONE A: BRAND LOGO */}
            <div className="flex items-center shrink-0">
              <Link
                href="/"
                className="flex items-center py-1 transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red rounded-lg"
                aria-label="Fortiva Shop Beranda"
              >
                <span className="flex md:hidden">
                  <Logo height={32} />
                </span>
                <span className="hidden md:flex">
                  <Logo height={36} />
                </span>
              </Link>
            </div>

            {/* ZONE B: PROMINENT SEARCH BAR (Desktop & Tablet) */}
            <div className="hidden md:flex flex-1 max-w-[460px] mx-2">
              <div
                onClick={onOpenSearch}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenSearch();
                  }
                }}
                className="relative w-full h-[46px] flex items-center bg-stone-50 hover:bg-white text-stone-500 rounded-[14px] border border-stone-200/90 hover:border-stone-300 focus-within:border-[#111827] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#111827]/10 transition-all cursor-pointer shadow-2xs group"
              >
                <span className="absolute left-3.5 text-stone-400 group-hover:text-stone-600 transition-colors pointer-events-none">
                  <Icon name="search" className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  readOnly
                  value={searchQuery}
                  placeholder="Cari pulsa, paket data, token PLN..."
                  className="w-full h-full pl-10 pr-14 bg-transparent text-sm font-normal text-brand-navy placeholder:text-stone-400 cursor-pointer focus:outline-none"
                />
                <div className="absolute right-3 flex items-center pointer-events-none">
                  <kbd className="text-[11px] font-sans font-medium text-stone-500 bg-white border border-stone-200 px-2 py-0.5 rounded-[6px] shadow-2xs">
                    ⌘K
                  </kbd>
                </div>
              </div>
            </div>

            {/* ZONE C: NAVIGATION LINKS & SUPPORT ACTION */}
            <div className="hidden md:flex items-center gap-6 lg:gap-7 shrink-0">
              {/* Clean Text Navigation Links */}
              <nav className="flex items-center gap-6 lg:gap-7" aria-label="Menu Utama">
                <Link
                  href="/"
                  className={`text-sm tracking-tight transition-colors cursor-pointer relative py-2 ${
                    isHome
                      ? 'text-[#F2352B] font-bold'
                      : 'text-stone-700 hover:text-brand-navy font-semibold'
                  }`}
                >
                  Beranda
                  {isHome && (
                    <span className="absolute -bottom-[20px] inset-x-0 h-[2.5px] bg-[#F2352B] rounded-full" />
                  )}
                </Link>

                <a
                  href="/#terminal"
                  onClick={handleNavTerminal}
                  className="text-sm tracking-tight text-stone-700 hover:text-brand-navy font-semibold transition-colors cursor-pointer relative py-2"
                >
                  Produk
                </a>

                <a
                  href="/#panduan"
                  onClick={handleNavPromo}
                  className="text-sm tracking-tight text-stone-700 hover:text-brand-navy font-semibold transition-colors cursor-pointer relative py-2"
                >
                  Promo
                </a>

                <Link
                  href="/cek-pesanan"
                  className={`text-sm tracking-tight transition-colors cursor-pointer relative py-2 ${
                    isCekPesanan
                      ? 'text-[#F2352B] font-bold'
                      : 'text-stone-700 hover:text-brand-navy font-semibold'
                  }`}
                >
                  Cek Pesanan
                  {isCekPesanan && (
                    <span className="absolute -bottom-[20px] inset-x-0 h-[2.5px] bg-[#F2352B] rounded-full" />
                  )}
                </Link>
              </nav>

              {/* Subtle Hairline Divider */}
              <div className="h-6 w-px bg-stone-200" aria-hidden="true" />

              {/* Distinctive, Accessible WhatsApp CS Support Button */}
              <a
                href={whatsappUrl(settings, 'Halo CS Fortiva Shop, saya butuh bantuan transaksi')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-11 px-4 rounded-[12px] bg-[#16803C] hover:bg-[#137134] text-white font-bold text-xs tracking-tight shadow-xs hover:shadow transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16803C] focus-visible:ring-offset-2"
                aria-label="Hubungi WhatsApp Customer Service"
              >
                <svg
                  className="w-4 h-4 fill-current shrink-0"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>WhatsApp CS</span>
              </a>
            </div>

            {/* Mobile Header Actions (Visible on small screens only) */}
            <div className="flex md:hidden items-center gap-2.5">
              <a
                href={whatsappUrl(settings, 'Halo CS Fortiva Shop')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#16803C] hover:bg-[#137134] text-white font-bold text-xs shadow-xs"
                aria-label="WhatsApp CS"
              >
                <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>CS</span>
              </a>

              <button
                type="button"
                onClick={onOpenSearch}
                className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 flex items-center justify-center cursor-pointer focus:outline-none transition-all"
                aria-label="Cari produk"
              >
                <Icon name="search" className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      </header>
    </>
  );
};
