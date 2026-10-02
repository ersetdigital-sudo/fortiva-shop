'use client';

import React from 'react';
import { Logo } from './Logo';
import { Link } from '../router';

import { Icon } from './icons';
import { useCatalog } from '../lib/catalog-context';
import { setting, whatsappUrl } from '../lib/catalog-types';

const NAVIGATION = [
  { label: 'Home', href: '/' },
  { label: 'Katalog', href: '/#terminal' },
  { label: 'Promo', href: '/#promo' },
  { label: 'Cek Pesanan', href: '/cek-pesanan' },
];

const BANTUAN = [
  { label: 'FAQ', href: '/bantuan' },
  { label: 'Panduan Pembayaran', href: '/panduan-qris' },
  { label: 'Hubungi Kami', href: '/bantuan' },
];

const BRAND_DESCRIPTION =
  'Marketplace produk digital untuk kebutuhan harian. Isi pulsa, paket data, token PLN, uang elektronik, dan pembayaran tagihan dengan proses praktis melalui QRIS.';

export const Footer: React.FC = () => {
  const { settings } = useCatalog();
  const supportEmail = setting(settings, 'support_email', '');

  return (
    <footer className="bg-white border-t border-stone-200/90 mt-12 pt-12 pb-8">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-stone-200/80">
          {/* Brand + deskripsi */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <Logo height={32} />
            </Link>
            <p className="text-xs text-stone-600 leading-relaxed max-w-sm">{BRAND_DESCRIPTION}</p>
            <p className="flex items-start gap-2 text-[11px] text-stone-500 leading-relaxed">
              <Icon name="check_circle" className="w-4 h-4 text-brand-green shrink-0 mt-px" />
              <span>Pembayaran QRIS diverifikasi sebelum pesanan diproses.</span>
            </p>
          </div>

          {/* Navigasi */}
          <nav className="lg:col-span-3" aria-label="Navigasi footer">
            <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider mb-4">
              Navigasi
            </h4>
            <div className="space-y-2.5 text-xs">
              {NAVIGATION.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block text-stone-600 hover:text-brand-red transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Bantuan */}
          <nav className="lg:col-span-3" aria-label="Bantuan">
            <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider mb-4">
              Bantuan
            </h4>
            <div className="space-y-2.5 text-xs">
              {BANTUAN.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block text-stone-600 hover:text-brand-navy transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Kontak */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider mb-4">
              Kontak
            </h4>
            <a
              href={whatsappUrl(settings, 'Halo Fortiva Shop, saya butuh bantuan')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700 hover:text-brand-navy transition-colors"
            >
              <Icon name="support_agent" className="w-4 h-4 text-emerald-600 shrink-0" />
              WhatsApp CS
            </a>
            <p className="mt-2.5 text-[11px] text-stone-500">
              {setting(settings, 'whatsapp_label', '08.00–22.00 WIB')}
            </p>
            {supportEmail && (
              <a
                href={`mailto:${supportEmail}`}
                className="mt-2.5 block text-[11px] text-stone-600 hover:text-brand-navy transition-colors"
              >
                {supportEmail}
              </a>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© 2026 {setting(settings, 'site_name', 'Fortiva Shop')}. Seluruh hak cipta dilindungi.</p>
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
