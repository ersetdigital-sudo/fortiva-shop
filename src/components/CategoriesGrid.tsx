'use client';


import React from 'react';
import { ProductCategory } from '../types';

import { Icon, IconName } from './icons';

interface CategoriesGridProps {
  onSelectCategory: (category: ProductCategory, providerId?: string) => void;
}

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  onSelectCategory,
}) => {
  const items: Array<{
    id: ProductCategory;
    providerId?: string;
    title: string;
    description: string;
    icon: IconName;
    iconBg: string;
    iconColor: string;
    borderColor: string;
    hoverText: string;
  }> = [
    {
      id: 'pulsa',
      title: 'Pulsa',
      description: 'Mobile credit & transfer',
      icon: 'call',
      iconBg: 'bg-red-50',
      iconColor: 'text-brand-red',
      borderColor: 'hover:border-brand-red',
      hoverText: 'group-hover:text-brand-red',
    },
    {
      id: 'data',
      title: 'Paket Data',
      description: 'Kuota internet 24 jam',
      icon: 'language',
      iconBg: 'bg-blue-50',
      iconColor: 'text-brand-blue',
      borderColor: 'hover:border-brand-blue',
      hoverText: 'group-hover:text-brand-blue',
    },
    {
      id: 'pln',
      title: 'PLN',
      description: 'Token & tagihan listrik',
      icon: 'electric_bolt',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderColor: 'hover:border-amber-400',
      hoverText: 'group-hover:text-amber-700',
    },
    {
      id: 'tagihan',
      providerId: 'pdam',
      title: 'PDAM',
      description: 'Tagihan air bersih daerah',
      icon: 'water_drop',
      iconBg: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      borderColor: 'hover:border-cyan-500',
      hoverText: 'group-hover:text-cyan-700',
    },
    {
      id: 'tagihan',
      providerId: 'bpjs',
      title: 'BPJS',
      description: 'Kesehatan & Ketenagakerjaan',
      icon: 'health_and_safety',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderColor: 'hover:border-emerald-500',
      hoverText: 'group-hover:text-emerald-700',
    },
    {
      id: 'tagihan',
      providerId: 'indihome',
      title: 'Pembayaran Internet',
      description: 'IndiHome, Biznet, FirstMedia',
      icon: 'router',
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      borderColor: 'hover:border-indigo-500',
      hoverText: 'group-hover:text-indigo-700',
    },
    {
      id: 'ewallet',
      title: 'Uang Elektronik',
      description: 'Top up saldo e-wallet',
      icon: 'account_balance_wallet',
      iconBg: 'bg-blue-50',
      iconColor: 'text-brand-blue',
      borderColor: 'hover:border-brand-blue',
      hoverText: 'group-hover:text-brand-blue',
    },
    {
      id: 'tagihan',
      providerId: 'multifinance',
      title: 'Multifinance',
      description: 'Angsuran & cicilan kredit',
      icon: 'payments',
      iconBg: 'bg-stone-100',
      iconColor: 'text-stone-800',
      borderColor: 'hover:border-stone-800',
      hoverText: 'group-hover:text-stone-900',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
          Mulai dari Kebutuhanmu
        </h2>
        <p className="text-sm sm:text-base text-stone-500 mt-1">
          Pilih layanan dan temukan nominal yang sesuai.
        </p>
      </div>

      {/* 8 Categories in balanced 4-column x 2-row grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelectCategory(item.id, item.providerId)}
            className={`bg-white border border-stone-200/90 ${item.borderColor} rounded-xl p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md group flex flex-col justify-between min-h-[140px] cursor-pointer`}
          >
            <div
              className={`w-10 h-10 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center group-hover:scale-105 transition-transform mb-3`}
            >
              <Icon name={item.icon} className="w-[22px] h-[22px]" />
            </div>
            <div>
              <h3
                className={`text-base font-bold text-brand-navy ${item.hoverText} transition-colors`}
              >
                {item.title}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                {item.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
