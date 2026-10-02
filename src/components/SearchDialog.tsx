'use client';

import React, { useState, useEffect } from 'react';
import { ProductCategory, ProviderItem, NominalItem } from '../types';
import { useCatalog } from '../lib/catalog-context';

import { Icon } from './icons';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (category: ProductCategory, provider: ProviderItem, nominal: NominalItem) => void;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const catalog = useCatalog();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Flatten searchable catalog (kategori x provider x nominal)
  const entries: Array<{
    category: ProductCategory;
    provider: ProviderItem;
    nominal: NominalItem;
    categoryLabel: string;
  }> = [];

  for (const cat of catalog.categories) {
    const slug = cat.slug as ProductCategory;
    const provs = catalog.providersByCategory[cat.slug] ?? [];
    const noms = catalog.nominalsByCategory[cat.slug] ?? [];
    const categoryLabel = catalog.categoriesConfig[cat.slug]?.label ?? cat.label;

    for (const prov of provs) {
      for (const nom of noms) {
        entries.push({ category: slug, provider: prov, nominal: nom, categoryLabel });
      }
    }
  }

  const query = searchTerm.toLowerCase().trim();
  const filtered = entries
    .filter(
      (item) =>
        !query ||
        item.provider.name.toLowerCase().includes(query) ||
        item.nominal.label.toLowerCase().includes(query) ||
        item.categoryLabel.toLowerCase().includes(query) ||
        item.nominal.description.toLowerCase().includes(query)
    )
    .slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-brand-navy/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-stone-200">
        <div className="relative border-b border-stone-200 p-3 flex items-center">
          <span className="ml-2 text-stone-400 shrink-0">
            <Icon name="search" className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari pulsa 50k, token PLN, GoPay, kuota Telkomsel..."
            className="w-full px-3 py-1.5 text-sm text-brand-navy focus:outline-none placeholder:text-stone-400"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-600 cursor-pointer"
          >
            <kbd className="text-[10px] font-mono bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded">
              ESC
            </kbd>
          </button>
        </div>

        <div className="p-2 max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-500">
              Tidak ditemukan produk yang cocok dengan &quot;{searchTerm}&quot;.
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectProduct(item.category, item.provider, item.nominal);
                    onClose();
                  }}
                  className="p-3 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span
                      style={{ backgroundColor: item.provider.bgColor, color: item.provider.textColor }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px]"
                    >
                      {item.provider.shortName}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-brand-navy group-hover:text-brand-red transition-colors">
                        {item.provider.name} - {item.nominal.label}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {item.categoryLabel} • {item.nominal.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-brand-red num-tabular">
                      Rp{item.nominal.price.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-2.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
          <span>Pilih untuk langsung mengatur di terminal transaksi</span>
          <span>Fortiva Instant Engine</span>
        </div>
      </div>
    </div>
  );
};
