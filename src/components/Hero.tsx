'use client';

import React from 'react';
import { ProductCategory } from '../types';

import { Icon, IconName } from './icons';

interface HeroProps {
  onQuickSelect: (category: ProductCategory, nominalId?: string, providerId?: string) => void;
  onScrollToTerminal: () => void;
  onScrollToTracking: () => void;
}

const STATS = [
  { value: '12.480+', label: 'Transaksi hari ini' },
  { value: '~4 dtk', label: 'Rata-rata proses' },
  { value: '24/7', label: 'Layanan aktif' },
];

const TRUST: { icon: IconName; text: string; color: string }[] = [
  { icon: 'verified_user', text: 'QRIS Standar Nasional', color: 'text-brand-green' },
  { icon: 'security', text: 'Enkripsi 256-bit', color: 'text-brand-blue' },
  { icon: 'check_circle', text: 'Biller resmi', color: 'text-emerald-600' },
];

export const Hero: React.FC<HeroProps> = ({
  onQuickSelect,
  onScrollToTerminal,
  onScrollToTracking,
}) => {
  return (
    <section className="relative overflow-hidden">
      {/* Dekorasi latar */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -top-32 right-[-12%] w-[560px] h-[560px] rounded-full bg-brand-red/10 blur-[90px]" />
        <div className="absolute top-40 left-[-16%] w-[440px] h-[440px] rounded-full bg-brand-blue/10 blur-[90px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[220px] rounded-full bg-brand-yellow/25 blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 sm:pt-12 sm:pb-14 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-9 lg:gap-14 items-center">
          {/* ---------- Kolom kiri ---------- */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-brand-red/20 text-brand-red text-[11px] font-bold tracking-wider uppercase mb-5 shadow-2xs backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-red" />
              </span>
              Gateway PPOB Aktif 24 Jam
            </span>

            <h1 className="text-[34px] leading-[1.06] sm:text-5xl lg:text-[58px] font-extrabold text-brand-navy tracking-[-0.035em]">
              Urus Tagihan &amp; Isi Saldo,
              <br />
              <span className="text-brand-red">Tanpa Ribet.</span>
            </h1>

            <p className="text-[15px] sm:text-lg text-stone-600 leading-relaxed max-w-xl mt-5">
              Dari pulsa dan paket data hingga token listrik PLN dan tagihan rutin — semua
              dalam satu tempat, dibayar praktis pakai QRIS.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-7">
              <button
                onClick={onScrollToTerminal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
              >
                <Icon name="bolt" className="w-[19px] h-[19px]" />
                <span>Jelajahi Produk</span>
              </button>
              <button
                onClick={onScrollToTracking}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/90 hover:bg-white text-brand-navy font-semibold text-sm border border-stone-200 shadow-2xs backdrop-blur transition-all active:scale-[0.99] cursor-pointer"
              >
                <Icon name="search_check" className="w-[19px] h-[19px] text-stone-500" />
                <span>Cek Pesanan</span>
              </button>
            </div>

            {/* Statistik */}
            <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-6 w-full max-w-md">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="text-lg sm:text-xl font-extrabold text-brand-navy num-tabular tracking-tight leading-none">
                    {s.value}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-stone-500 mt-1 leading-tight">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Trust */}
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold text-stone-500">
              {TRUST.map((t) => (
                <span key={t.text} className="inline-flex items-center gap-1.5">
                  <Icon name={t.icon} className={`w-3.5 h-3.5 ${t.color}`} />
                  {t.text}
                </span>
              ))}
            </div>
          </div>

          {/* ---------- Kolom kanan: transaksi cepat ---------- */}
          <div className="lg:col-span-5 w-full">
            <div className="flex items-center justify-between mb-3 px-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Transaksi Cepat
              </span>
              <span className="text-[11px] text-stone-400">Ketuk untuk memilih</span>
            </div>

            <div className="flex flex-col gap-3">
              {/* Panel 1 — Pulsa */}
              <button
                type="button"
                onClick={() => onQuickSelect('pulsa', 'p50', 'telkomsel')}
                className="group relative w-full text-left bg-white border border-stone-200/90 hover:border-brand-red rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer overflow-hidden"
              >
                <span className="absolute left-0 top-0 h-full w-1 bg-brand-red opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-9 h-9 rounded-xl bg-red-50 text-brand-red flex items-center justify-center shrink-0">
                      <Icon name="call" className="w-[18px] h-[18px]" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                        Flash Fulfillment
                      </div>
                      <div className="text-base font-extrabold text-brand-navy group-hover:text-brand-red transition-colors truncate">
                        Pulsa 50.000
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center h-7 px-2.5 rounded-full bg-stone-100 text-stone-700 text-xs font-bold shrink-0 group-hover:bg-brand-red group-hover:text-white transition-colors num-tabular">
                    Rp50.500
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-stone-500 truncate">
                    Telkomsel · Indosat · XL · Tri
                  </span>
                  <span className="text-[11px] font-bold text-brand-green shrink-0">
                    Masuk 1–5 detik
                  </span>
                </div>
              </button>

              {/* Panel 2 — Token PLN */}
              <button
                type="button"
                onClick={() => onQuickSelect('pln', 'pln100', 'pln-prabayar')}
                className="group w-full text-left bg-brand-blue hover:bg-blue-700 text-white rounded-2xl p-4 sm:p-5 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-blue-100">
                    <Icon name="electric_bolt" className="w-4 h-4 text-brand-yellow" />
                    Token PLN Prabayar
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold shrink-0">
                    Stroom Instan
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-base font-extrabold">Nominal Rp100.000</div>
                    <p className="text-[11px] text-blue-100 mt-0.5">
                      20 digit token tercetak otomatis
                    </p>
                  </div>
                  <span className="text-xl font-black num-tabular text-brand-yellow shrink-0">
                    Rp102.500
                  </span>
                </div>
              </button>

              {/* Panel 3 — E-Wallet */}
              <button
                type="button"
                onClick={() => onQuickSelect('ewallet', 'ew50', 'gopay')}
                className="group w-full text-left bg-brand-yellow/85 hover:bg-brand-yellow border border-amber-300/80 rounded-2xl p-4 sm:p-5 text-brand-navy shadow-2xs hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-stone-800">
                    <Icon name="account_balance_wallet" className="w-4 h-4" />
                    Saldo E-Wallet
                  </span>
                  <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-2xs group-hover:translate-x-1 transition-transform shrink-0">
                    <Icon name="arrow_forward" className="w-4 h-4" />
                  </span>
                </div>
                <div className="text-base font-extrabold">Top Up E-Wallet</div>
                <div className="text-[11px] font-semibold text-stone-800 mt-0.5">
                  GoPay · DANA · OVO · ShopeePay
                </div>
                <div className="mt-2.5 pt-2.5 border-t border-stone-900/10 flex items-center justify-between">
                  <span className="text-[11px] text-stone-700">Mulai Rp20.000</span>
                  <span className="text-[11px] font-bold text-stone-800">Masuk instan</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
