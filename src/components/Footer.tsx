'use client';

import React from 'react';
import { CS_AVATAR_URL } from './Header';
import { Logo } from './Logo';
import { Link } from '../router';

import { Icon } from './icons';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-stone-200/90 mt-12 pt-12 pb-8">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-stone-200/80">
          {/* Col 1: Brand & Bio (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="inline-block">
              <Logo height={32} />
            </Link>
            <p className="text-xs text-stone-600 leading-relaxed max-w-sm">
              Platform lokapasar produk digital dan agregator PPOB resmi di
              Indonesia. Menyediakan transaksi pulsa, paket kuota, token listrik
              PLN, hingga pembayaran tagihan rutin dengan verifikasi QRIS instan.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 pt-1">
              <Icon name="security" className="w-4 h-4 text-brand-blue shrink-0" />
              <span>Terkoneksi Biller Resmi &amp; Enkripsi 256-Bit</span>
            </div>
          </div>

          {/* Col 2: Kategori Produk (4 cols) */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider mb-4">
              Kategori Layanan
            </h4>
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
              <Link
                href="/?category=pulsa#terminal"
                className="text-stone-600 hover:text-brand-red text-left transition-colors cursor-pointer"
              >
                Pulsa Reguler
              </Link>
              <Link
                href="/?category=ewallet#terminal"
                className="text-stone-600 hover:text-brand-red text-left transition-colors cursor-pointer"
              >
                Uang Elektronik
              </Link>
              <Link
                href="/?category=data#terminal"
                className="text-stone-600 hover:text-brand-red text-left transition-colors cursor-pointer"
              >
                Paket Data
              </Link>
              <Link
                href="/?category=tagihan&prov=multifinance#terminal"
                className="text-stone-600 hover:text-brand-red text-left transition-colors cursor-pointer"
              >
                Multifinance
              </Link>
              <Link
                href="/?category=pln#terminal"
                className="text-stone-600 hover:text-brand-red text-left transition-colors cursor-pointer"
              >
                Token Listrik PLN
              </Link>
              <Link
                href="/?category=tagihan&prov=indihome#terminal"
                className="text-stone-600 hover:text-brand-red text-left transition-colors cursor-pointer"
              >
                Internet &amp; TV Kabel
              </Link>
              <Link
                href="/?category=tagihan&prov=bpjs#terminal"
                className="text-stone-600 hover:text-brand-red text-left transition-colors cursor-pointer"
              >
                BPJS Kesehatan
              </Link>
              <Link
                href="/?category=tagihan&prov=pdam#terminal"
                className="text-stone-600 hover:text-brand-red text-left transition-colors cursor-pointer"
              >
                Tagihan PDAM
              </Link>
            </div>
          </div>

          {/* Col 3: Bantuan & Jam Kerja (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider mb-4">
              Pusat Bantuan
            </h4>
            <div className="space-y-2.5 text-xs">
              <Link
                href="/cek-pesanan"
                className="block text-stone-600 hover:text-brand-navy text-left transition-colors"
              >
                Lacak Status Pesanan
              </Link>
              <Link
                href="/panduan-qris"
                className="block text-stone-600 hover:text-brand-navy text-left transition-colors"
              >
                Panduan Pembayaran QRIS
              </Link>
              <a
                href="https://wa.me/6281234567890?text=Halo%20CS%20Fortiva%20Shop,%20saya%20butuh%20bantuan"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-stone-600 hover:text-brand-navy transition-colors"
              >
                Hubungi CS WhatsApp
              </a>
              <Link
                href="/syarat-ketentuan"
                className="block text-stone-600 hover:text-brand-navy transition-colors"
              >
                Syarat &amp; Ketentuan Layanan
              </Link>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center gap-3 mt-4">
              <div className="relative w-8 h-8 shrink-0">
                <img
                  src={CS_AVATAR_URL}
                  alt="CS"
                  className="w-8 h-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>
              </div>
              <div>
                <div className="text-xs font-bold text-brand-navy">
                  Dukungan Prioritas
                </div>
                <div className="text-[11px] text-stone-500">
                  08:00 - 22:00 WIB
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© 2026 Fortiva Shop (Jaringan Ekosistem Digital). Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-4">
            <Link href="/kebijakan-privasi" className="hover:text-brand-navy transition-colors">
              Kebijakan Privasi
            </Link>
            <span className="text-stone-300">•</span>
            <Link href="/syarat-ketentuan" className="hover:text-brand-navy transition-colors">
              Syarat &amp; Ketentuan
            </Link>
            <span className="text-stone-300">•</span>
            <Link href="/bantuan" className="hover:text-brand-navy transition-colors">
              Pusat Bantuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
