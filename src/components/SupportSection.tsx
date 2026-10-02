'use client';


import React, { useState } from 'react';
import { Link, useRouter } from '../router';

import { Icon } from './icons';
import { useCatalog } from '../lib/catalog-context';
import { whatsappUrl } from '../lib/catalog-types';

export const SupportSection: React.FC = () => {
  const { navigate } = useRouter();
  const { settings } = useCatalog();
  const [invoiceQuery, setInvoiceQuery] = useState('');

  const handleLacak = (e: React.FormEvent) => {
    e.preventDefault();
    if (invoiceQuery.trim()) {
      navigate(`/cek-pesanan?inv=${encodeURIComponent(invoiceQuery.trim().toUpperCase())}`);
    } else {
      navigate('/cek-pesanan');
    }
  };

  return (
    <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10" id="cek-pesanan">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Entry 1: Cek Status Pesanan */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-brand-navy flex items-center justify-center mb-3">
              <Icon name="receipt" className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-brand-navy">
              Cek Status Pesanan
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-4 leading-relaxed">
              Sudah bertransaksi? Masukkan ID Faktur untuk memeriksa status pengiriman pulsa, paket data, atau token.
            </p>
            <form onSubmit={handleLacak} className="flex gap-2">
              <input
                type="text"
                value={invoiceQuery}
                onChange={(e) => setInvoiceQuery(e.target.value)}
                placeholder="INV-2025-XXXXX"
                className="flex-1 h-10 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg uppercase tracking-wider font-semibold focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-navy"
              />
              <button
                type="submit"
                className="px-4 h-10 bg-brand-navy hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer"
              >
                Lacak
              </button>
            </form>
          </div>
          <p className="text-[11px] text-stone-400 mt-4">
            Data tersimpan rapi selama 90 hari kalender.
          </p>
        </div>

        {/* Entry 2: Panduan Pembayaran QRIS */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center mb-3">
              <Icon name="menu_book" className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-brand-navy">
              Panduan Pembayaran QRIS
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-4 leading-relaxed">
              Pelajari tata cara scan kode QRIS melalui m-Banking (BCA, Mandiri,
              BRI, BNI) atau aplikasi e-wallet tanpa biaya admin.
            </p>
            <div className="space-y-1.5 text-xs text-stone-700">
              <div className="flex items-center gap-1.5">
                <Icon name="check_circle" className="w-[15px] h-[15px] text-brand-green shrink-0" />
                <span>Tanpa potongan biaya transfer</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="check_circle" className="w-[15px] h-[15px] text-brand-green shrink-0" />
                <span>Verifikasi otomatis dalam hitungan detik</span>
              </div>
            </div>
          </div>
          <Link
            href="/panduan-qris"
            className="text-xs font-bold text-brand-blue hover:underline inline-flex items-center gap-1 mt-4 text-left cursor-pointer"
          >
            Buka Panduan Lengkap{' '}
            <Icon name="arrow_forward" className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Entry 3: Hubungi Customer Service */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <Icon name="support_agent" className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-brand-navy">
              Pusat Bantuan Resmi
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-4 leading-relaxed">
              Ada kendala pengisian pulsa atau token PLN belum tercetak? Tim bantuan
              teknis kami siap memverifikasi langsung.
            </p>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Status Layanan:</span>
                <span className="font-bold text-brand-green flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>{' '}
                  Online
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Jam Operasional:</span>
                <span className="font-semibold text-brand-navy">
                  08:00 - 22:00 WIB
                </span>
              </div>
            </div>
          </div>
          <a
            href={whatsappUrl(settings, 'Halo Fortiva Shop, saya butuh bantuan teknis pesanan')}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full h-10 rounded-lg bg-brand-green hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Icon name="chat" className="w-4 h-4" />
            <span>Chat WhatsApp Sekarang</span>
          </a>
        </div>
      </div>
    </section>
  );
};
