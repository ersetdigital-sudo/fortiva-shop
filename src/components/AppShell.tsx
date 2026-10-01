'use client';

import React, { useState } from 'react';
import { ProductCategory, ProviderItem, NominalItem } from '../types';
import { useRouter } from '../router';
import { Header } from './Header';
import { Footer } from './Footer';
import { SearchDialog } from './SearchDialog';
import { MobileTabBar } from './MobileTabBar';

/**
 * Global application shell: keeps Header, Footer and the global Quick Search
 * dialog mounted across every route (exactly like the original Vite app did),
 * and renders the active route content inside <main>.
 */
export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { navigate } = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Search dialog item selected -> deep-link to the product on the home terminal
  const handleProductSelectedFromSearch = (
    cat: ProductCategory,
    prov: ProviderItem,
    nom: NominalItem
  ) => {
    navigate(`/?category=${cat}&prov=${prov.id}&nom=${nom.id}#terminal`);
  };

  return (
    <div className="bg-[#F7F6F2] text-[#111827] min-h-screen flex flex-col antialiased">
      {/* Global Header */}
      <Header onOpenSearch={() => setIsSearchOpen(true)} searchQuery="" />

      {/* Main Page Routing Switch */}
      <main className="flex-1 w-full">{children}</main>

      {/* Global Footer */}
      <Footer />

      {/* Spacer: cegah bottom tab bar menutupi konten/footer di mobile */}
      <div className="h-[72px] md:hidden" aria-hidden="true" />

      {/* Mobile app-style bottom navigation */}
      <MobileTabBar />

      {/* Global Quick Search Dialog (⌘K) */}
      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleProductSelectedFromSearch}
      />
    </div>
  );
};
