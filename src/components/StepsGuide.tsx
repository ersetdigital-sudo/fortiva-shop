'use client';


import React from 'react';

import { Icon } from './icons';

export const StepsGuide: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
          MUDAH DAN PRAKTIS
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight mt-1">
          Transaksi dalam 3 Langkah
        </h2>
        <p className="text-sm text-stone-500 mt-1">
          Pilih layanan, masukkan nomor tujuan, lalu selesaikan pembayaran.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 01 */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-black text-brand-red num-tabular">
                01
              </span>
              <div className="w-10 h-10 rounded-xl bg-red-50 text-brand-red flex items-center justify-center">
                <Icon name="touch_app" className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-base font-bold text-brand-navy mb-2">
              Pilih Produk
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Temukan pulsa, paket data, token PLN, dan layanan digital sesuai
              kebutuhanmu.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-stone-100 text-xs font-bold text-brand-red">
            Pilih layanan dan nominal
          </div>
        </div>

        {/* Step 02 */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-black text-brand-blue num-tabular">
                02
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
                <Icon name="pin" className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-base font-bold text-brand-navy mb-2">
              Masukkan Nomor Tujuan
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Isi nomor HP, ID pelanggan, atau nomor meter sesuai layanan.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-stone-100 text-xs font-bold text-brand-blue">
            Periksa kembali sebelum membayar
          </div>
        </div>

        {/* Step 03 */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-black text-amber-600 num-tabular">
                03
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Icon name="qr_code_scanner" className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-base font-bold text-brand-navy mb-2">
              Bayar dan Selesaikan
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Selesaikan pembayaran melalui metode yang tersedia, lalu cek status
              transaksi dan detail pesananmu.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-stone-100 text-xs font-bold text-amber-700">
            Pantau status pesanan dengan mudah
          </div>
        </div>
      </div>
    </section>
  );
};
