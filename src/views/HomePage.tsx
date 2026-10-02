'use client';

import React, { useState, useEffect } from 'react';
import { ProductCategory, ProviderItem, NominalItem, TransactionRecord } from '../types';
import { detectProviderFromPhone, validateDestination } from '../data/products';
import { useCatalog } from '../lib/catalog-context';
import type { Catalog } from '../lib/catalog-types';
import { findNominal, findProvider } from '../lib/catalog-lookup';
import { placeOrder } from '../app/actions/orders';
import { useRouter } from '../router';
import { Hero } from '../components/Hero';
import { CategoriesGrid } from '../components/CategoriesGrid';
import { OrderTerminal } from '../components/OrderTerminal';
import { PromoBanner } from '../components/PromoBanner';
import { StepsGuide } from '../components/StepsGuide';
import { SupportSection } from '../components/SupportSection';
import { CheckoutSheet } from '../components/CheckoutSheet';

/** Provider cadangan kalau katalog belum punya data untuk kategori tsb. */
const EMPTY_PROVIDER: ProviderItem = {
  id: '',
  name: '-',
  code: '',
  shortName: '-',
  bgColor: '#111827',
  textColor: '#FFFFFF',
};

const EMPTY_NOMINAL: NominalItem = {
  id: '',
  label: '-',
  description: '',
  price: 0,
};

function firstProviderFor(catalog: Catalog, slug: string): ProviderItem {
  return catalog.providersByCategory[slug]?.[0] ?? EMPTY_PROVIDER;
}

/** Nominal default: badge POPULER bila ada, kalau tidak item pertama. */
function preferredNominalFor(catalog: Catalog, slug: string): NominalItem {
  const list = catalog.nominalsByCategory[slug] ?? [];
  return list.find((item) => item.badge === 'POPULER') ?? list[0] ?? EMPTY_NOMINAL;
}

export const HomePage: React.FC = () => {
  const { path, query, navigate } = useRouter();
  const catalog = useCatalog();

  // Category, Provider, Destination, Nominal state
  const [category, setCategory] = useState<ProductCategory>(
    () => (catalog.categories[0]?.slug as ProductCategory) ?? 'pulsa'
  );
  const [provider, setProvider] = useState<ProviderItem>(() =>
    firstProviderFor(catalog, catalog.categories[0]?.slug ?? 'pulsa')
  );
  const [destination, setDestination] = useState<string>('081234567890');
  const [nominal, setNominal] = useState<NominalItem>(() =>
    preferredNominalFor(catalog, catalog.categories[0]?.slug ?? 'pulsa')
  );

  // Checkout flow state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [currentTransaction, setCurrentTransaction] = useState<TransactionRecord | null>(null);

  // Check URL query on homepage (e.g. /?category=pln&prov=...&nom=...)
  useEffect(() => {
    const catQuery = query.get('category') as ProductCategory | null;
    const provQuery = query.get('prov');
    const nomQuery = query.get('nom');
    if (catQuery && catalog.providersByCategory[catQuery]) {
      handleCategoryChange(catQuery, provQuery || undefined, nomQuery || undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, catalog]);

  // Scroll to the hash target on mount (handles cross-page navigation to /#terminal etc.)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      const id = hash.substring(1);
      const timeout = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, []);

  // When category changes, reset provider & nominal to category's defaults
  const handleCategoryChange = (
    newCat: ProductCategory,
    forcedProviderId?: string,
    forcedNominalId?: string
  ) => {
    setCheckoutError(null);
    setCategory(newCat);

    // Resolver toleran: menerima id database, kode, nama/label, atau penanda lama.
    setProvider(findProvider(catalog, newCat, forcedProviderId) ?? EMPTY_PROVIDER);
    setNominal(findNominal(catalog, newCat, forcedNominalId) ?? EMPTY_NOMINAL);
  };

  // Phone input with automatic provider detection
  const handleDestinationChange = (val: string) => {
    setDestination(val);
    setCheckoutError(null);
    if (category === 'pulsa' || category === 'data') {
      const detectedName = detectProviderFromPhone(val);
      const catProviders = catalog.providersByCategory[category] ?? [];
      const match = catProviders.find((p) =>
        p.name.toLowerCase().includes(detectedName.toLowerCase())
      );
      if (match && match.id !== provider.id) {
        setProvider(match);
      }
    }
  };

  // Quick selection from Hero panels
  const handleQuickSelect = (
    cat: ProductCategory,
    nominalId?: string,
    providerId?: string
  ) => {
    handleCategoryChange(cat, providerId, nominalId);
    scrollToSection('terminal');
  };

  // Smooth scroll helper
  const scrollToSection = (id: string) => {
    if (path !== '/') {
      navigate(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Trigger QRIS Checkout
  const handleTriggerCheckout = () => {
    const validationError = validateDestination(category, destination);
    if (validationError) {
      setCheckoutError(validationError);
      return;
    }
    setCheckoutError(null);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const categoryName = catalog.categoriesConfig[category]?.name ?? category;

    const newTx: TransactionRecord = {
      id: 'tx-' + Date.now(),
      invoiceNumber: 'MENUNGGU…',
      categoryName,
      providerName: provider.name,
      nominalLabel: nominal.label,
      destination: destination || '081234567890',
      totalPrice: nominal.price,
      adminFee: 0,
      // Baru dibuat, pelanggan belum melaporkan pembayaran.
      status: 'PENDING_PAYMENT',
      createdAt: `Hari ini, ${timeStr} WIB`,
    };

    setCurrentTransaction(newTx);
    setIsCheckoutOpen(true);
  };

  /**
   * Pelanggan menekan "Saya Sudah Bayar".
   * Pesanan disimpan sebagai WAITING_VERIFICATION — TANPA serial/token dan
   * tanpa klaim keberhasilan. Verifikasi dilakukan admin di panel.
   */
  const handleConfirmPayment = async (tx: TransactionRecord) => {
    const result = await placeOrder({
      categorySlug: category,
      categoryName: tx.categoryName,
      providerName: tx.providerName,
      nominalLabel: tx.nominalLabel,
      destination: tx.destination,
      totalPrice: tx.totalPrice,
      adminFee: tx.adminFee,
    });

    if (!result.ok || !result.invoiceNumber) {
      return { ok: false, error: result.error };
    }

    setCurrentTransaction({
      ...tx,
      status: 'WAITING_VERIFICATION',
      invoiceNumber: result.invoiceNumber,
    });

    return { ok: true, invoiceNumber: result.invoiceNumber };
  };

  return (
    <>
      {/* Hero Section */}
      <Hero
        onQuickSelect={handleQuickSelect}
        onScrollToTerminal={() => scrollToSection('terminal')}
        onScrollToTracking={() => navigate('/cek-pesanan')}
      />

      {/* 8-Card Category Grid */}
      <CategoriesGrid
        onSelectCategory={(cat, provId) => {
          handleCategoryChange(cat, provId);
          scrollToSection('terminal');
        }}
      />

      {/* Product Discovery & Order Terminal */}
      <OrderTerminal
        category={category}
        setCategory={handleCategoryChange}
        provider={provider}
        setProvider={setProvider}
        destination={destination}
        setDestination={handleDestinationChange}
        nominal={nominal}
        setNominal={setNominal}
        onCheckout={handleTriggerCheckout}
        error={checkoutError}
      />

      {/* Promotional Banner */}
      <PromoBanner onScrollToTerminal={() => scrollToSection('terminal')} />

      {/* 3 Steps Guide */}
      <StepsGuide />

      {/* Support Entry Points Section */}
      <SupportSection />

      {/* Multi-step Checkout Sheet: Konfirmasi → Bayar → Proses → Sukses */}
      <CheckoutSheet
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        transaction={currentTransaction}
        onConfirmPayment={handleConfirmPayment}
      />
    </>
  );
};
