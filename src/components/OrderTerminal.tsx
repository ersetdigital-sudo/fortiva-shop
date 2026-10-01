'use client';


import React, { useState, useEffect, useRef } from 'react';
import { ProductCategory, ProviderItem, NominalItem } from '../types';
import { CATEGORIES_CONFIG, PROVIDERS_BY_CATEGORY, NOMINALS_BY_CATEGORY } from '../data/products';

import { Icon } from './icons';

interface OrderTerminalProps {
  category: ProductCategory;
  setCategory: (c: ProductCategory) => void;
  provider: ProviderItem;
  setProvider: (p: ProviderItem) => void;
  destination: string;
  setDestination: (d: string) => void;
  nominal: NominalItem;
  setNominal: (n: NominalItem) => void;
  onCheckout: () => void;
  /** Pesan error validasi nomor tujuan (opsional). */
  error?: string | null;
}

export const OrderTerminal: React.FC<OrderTerminalProps> = ({
  category,
  setCategory,
  provider,
  setProvider,
  destination,
  setDestination,
  nominal,
  setNominal,
  onCheckout,
  error,
}) => {
  const currentCategoryConfig = CATEGORIES_CONFIG[category];
  const providers = PROVIDERS_BY_CATEGORY[category] || [];
  const nominals = NOMINALS_BY_CATEGORY[category] || [];

  // Sticky CTA mobile: tampil hanya saat seksi terminal terlihat di layar
  const sectionRef = useRef<HTMLElement>(null);
  const [showPayBar, setShowPayBar] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowPayBar(entry.isIntersecting),
      { rootMargin: '-96px 0px -140px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const tabs: Array<{ key: ProductCategory; label: string }> = [
    { key: 'pulsa', label: 'Pulsa' },
    { key: 'data', label: 'Paket Data' },
    { key: 'pln', label: 'Token PLN' },
    { key: 'ewallet', label: 'E-Wallet' },
    { key: 'tagihan', label: 'Tagihan Rutin' },
  ];

  const handleClearDestination = () => {
    setDestination('');
  };

  return (
    <section
      ref={sectionRef}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-28 lg:pb-10"
      id="terminal"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
        <div>
          <span className="text-xs font-bold text-brand-red uppercase tracking-wider">
            Terminal Transaksi Cepat
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight mt-1">
            Produk Digital Pilihan
          </h2>
          <p className="text-sm text-stone-500">
            Temukan layanan yang kamu butuhkan dan pilih nominalnya.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-green bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Gateway PPOB Aktif 24 Jam
        </div>
      </div>

      {/* Main Asymmetric Workspace (7:5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Configuration & Denominations (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Category Horizontal Tabs */}
          <div className="bg-white p-1.5 rounded-xl border border-stone-200/80 flex items-center gap-1.5 overflow-x-auto shadow-2xs">
            {tabs.map((tab) => {
              const isActive = category === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setCategory(tab.key)}
                  className={`category-tab px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-red text-white font-bold shadow-xs'
                      : 'text-stone-600 font-semibold hover:text-brand-navy hover:bg-stone-50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Provider Selector Chips */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              Pilih Provider / Operator
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {providers.map((prov) => {
                const isActive = provider?.id === prov.id;
                return (
                  <button
                    key={prov.id}
                    onClick={() => setProvider(prov)}
                    className={`prov-chip p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      isActive
                        ? 'border-brand-red bg-red-50/50 text-brand-navy ring-1 ring-brand-red/30'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300 hover:bg-stone-100/70'
                    }`}
                  >
                    <span
                      style={{ backgroundColor: prov.bgColor, color: prov.textColor }}
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs"
                    >
                      {prov.shortName}
                    </span>
                    <span
                      className={`text-xs text-center line-clamp-1 ${
                        isActive ? 'font-bold' : 'font-semibold'
                      }`}
                    >
                      {prov.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Destination Number with Auto-detect */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label
                htmlFor="input-destination"
                className="text-xs font-bold uppercase tracking-wider text-stone-500"
              >
                {currentCategoryConfig.inputLabel}
              </label>
              <span className="inline-flex items-center text-xs font-bold text-brand-blue bg-blue-50 px-2.5 py-0.5 rounded-full">
                <span>Terdeteksi: {provider?.name || 'Telkomsel'}</span>
              </span>
            </div>
            <div className="relative">
              <input
                id="input-destination"
                type="tel"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={currentCategoryConfig.inputPlaceholder}
                className={`w-full h-12 px-4 bg-stone-50 rounded-xl text-base font-bold text-brand-navy num-tabular border focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                  error
                    ? 'border-brand-red ring-2 ring-brand-red/20'
                    : 'border-stone-200 focus:ring-brand-red/30 focus:border-brand-red'
                }`}
              />
              {destination && (
                <button
                  type="button"
                  onClick={handleClearDestination}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <Icon name="cancel" className="w-[18px] h-[18px]" />
                </button>
              )}
            </div>
            {error ? (
              <p className="text-xs font-semibold text-brand-red mt-2">{error}</p>
            ) : (
              <p className="text-xs text-stone-500 mt-2">
                {currentCategoryConfig.helperText}
              </p>
            )}
          </div>

          {/* Grid of Clean Nominal Cards */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
                Pilih Nominal
              </h3>
              <span className="text-xs text-stone-500">
                Harga resmi sudah termasuk PPN
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {nominals.map((item) => {
                const isSelected = nominal?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setNominal(item)}
                    className={`nom-item cursor-pointer p-3.5 rounded-xl transition-all text-left relative ${
                      isSelected
                        ? 'border-2 border-brand-red bg-red-50/20 shadow-xs'
                        : 'border border-stone-200 bg-white hover:border-stone-300 hover:shadow-2xs'
                    }`}
                  >
                    {item.badge === 'POPULER' && (
                      <span className="absolute -top-2.5 right-2 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-brand-red text-white uppercase tracking-wider shadow-xs">
                        POPULER
                      </span>
                    )}
                    {item.badge === 'HEMAT' && (
                      <span className="absolute -top-2.5 right-2 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 uppercase tracking-wider">
                        HEMAT
                      </span>
                    )}
                    <div className="text-base font-bold text-brand-navy num-tabular">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                      {item.description}
                    </div>
                    <div className="text-sm font-extrabold text-brand-red mt-2 num-tabular">
                      Rp{item.price.toLocaleString('id-ID')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel: Integrated Sticky Order Summary (5 cols) */}
        <div className="lg:col-span-5 sticky top-20">
          <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200/80">
              <div>
                <span className="text-xs font-bold text-brand-red uppercase tracking-wider">
                  Ringkasan Pesanan
                </span>
                <h3 className="text-lg font-bold text-brand-navy mt-0.5">
                  Detail Transaksi
                </h3>
              </div>
              <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                <Icon name="receipt_long" className="w-5 h-5" />
              </div>
            </div>

            {/* Ledger Info */}
            <div className="py-4 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Layanan Dipilih</span>
                <span className="font-bold text-brand-navy">
                  {currentCategoryConfig.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Provider</span>
                <span className="font-bold text-brand-navy">
                  {provider?.name || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Nominal</span>
                <span className="font-bold text-brand-navy">
                  {nominal?.label || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Nomor Tujuan</span>
                <span className="font-bold text-brand-navy num-tabular">
                  {destination || '081234567890'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Biaya Layanan</span>
                <span className="font-bold text-brand-green">
                  Rp0 (Promo QRIS)
                </span>
              </div>
            </div>

            {/* Total Price Block */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 mb-5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Total Pembayaran
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-brand-navy num-tabular">
                  Rp{(nominal?.price || 25750).toLocaleString('id-ID')}
                </div>
                <span className="text-[11px] font-bold text-brand-red bg-red-100/60 px-2 py-0.5 rounded">
                  QRIS DINAMIS
                </span>
              </div>
            </div>

            {/* Direct CTA Bayar Sekarang via QRIS */}
            <button
              type="button"
              onClick={onCheckout}
              className="w-full h-13 py-3.5 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white font-bold text-base flex items-center justify-center gap-2 shadow-xs hover:shadow transition-all active:scale-[0.99] cursor-pointer"
            >
              <Icon name="qr_code_2" className="w-5 h-5" />
              <span>Bayar Sekarang via QRIS</span>
            </button>

            {/* Security Note */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-stone-500">
              <Icon name="verified_user" className="w-[15px] h-[15px] text-emerald-600 shrink-0" />
              <span>Enkripsi 256-Bit SSL • Transaksi Otomatis</span>
            </div>
          </div>

          {/* Quick Help Support Box */}
          <div className="mt-4 p-4 rounded-2xl bg-white border border-stone-200/80 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <Icon name="headset_mic" className="w-6 h-6 text-brand-blue shrink-0" />
              <div>
                <div className="text-xs font-bold text-brand-navy">
                  Butuh Bantuan Transaksi?
                </div>
                <div className="text-[11px] text-stone-500">
                  Customer care kami merespons dalam 1-3 menit
                </div>
              </div>
            </div>
            <a
              href="https://wa.me/?text=Halo%20Fortiva,%20saya%20butuh%20bantuan%20transaksi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-brand-blue hover:underline whitespace-nowrap"
            >
              Chat Sekarang →
            </a>
          </div>
        </div>
      </div>

      {/* Sticky CTA mobile — selalu bisa bayar tanpa scroll ke bawah */}
      <div
        className={`lg:hidden fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 px-4 pb-2 transition-all duration-300 ${
          showPayBar
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-6 opacity-0 pointer-events-none'
        }`}
      >
        <div className="mx-auto max-w-xl bg-white/92 backdrop-blur-xl border border-stone-200/90 rounded-2xl shadow-[0_12px_34px_-12px_rgba(17,24,39,0.35)] p-2.5 flex items-center gap-3">
          <div className="min-w-0 flex-1 pl-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Total · {nominal?.label || '-'}
            </div>
            <div className="text-base font-extrabold text-brand-navy num-tabular leading-tight">
              Rp{(nominal?.price || 25750).toLocaleString('id-ID')}
            </div>
          </div>
          <button
            type="button"
            onClick={onCheckout}
            className="h-11 px-5 rounded-xl bg-brand-red hover:bg-brand-red-hover active:scale-[0.98] text-white font-bold text-sm inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Icon name="qr_code_2" className="w-[18px] h-[18px]" />
            Bayar QRIS
          </button>
        </div>
      </div>
    </section>
  );
};
