'use client';


import React from 'react';

import { Icon } from './icons';

interface PromoBannerProps {
  onScrollToTerminal: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ onScrollToTerminal }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="promo">
      <div className="bg-[#FFE78F]/85 border border-amber-300 rounded-3xl p-6 sm:p-10 text-brand-navy shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Text Content */}
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 text-xs font-bold text-stone-800 uppercase tracking-wider mb-3">
              <Icon name="bolt" className="w-3.5 h-3.5 text-brand-red" />
              BELANJA DIGITAL LEBIH PRAKTIS
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
              Semua Transaksi Digital, Lebih Mudah.
            </h2>

            <p className="text-sm sm:text-base text-stone-700 mt-2.5 max-w-2xl leading-relaxed">
              Penuhi kebutuhan pulsa, paket data, token listrik, dan pembayaran tagihan dalam satu tempat.
              Pilih layanan, masukkan nomor tujuan, lalu lanjutkan pembayaran dengan praktis.
            </p>
          </div>

          {/* Action CTA & Supporting Text */}
          <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center">
            <button
              onClick={onScrollToTerminal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white font-bold text-sm shadow-xs transition-all active:scale-[0.99] cursor-pointer"
            >
              Jelajahi Semua Produk
            </button>
            <span className="text-xs text-stone-700 font-medium mt-2.5 text-center lg:text-right">
              Pulsa · Paket Data · Token PLN · E-Wallet · Tagihan
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
