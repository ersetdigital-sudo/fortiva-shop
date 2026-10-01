'use client';

import React, { useState, useEffect } from 'react';
import { ProductCategory, ProviderItem, NominalItem, TransactionRecord } from '../types';
import {
  CATEGORIES_CONFIG,
  PROVIDERS_BY_CATEGORY,
  NOMINALS_BY_CATEGORY,
  detectProviderFromPhone,
  validateDestination,
} from '../data/products';
import { saveOrder } from '../services/orderService';
import { useRouter } from '../router';
import { Hero } from '../components/Hero';
import { CategoriesGrid } from '../components/CategoriesGrid';
import { OrderTerminal } from '../components/OrderTerminal';
import { PromoBanner } from '../components/PromoBanner';
import { StepsGuide } from '../components/StepsGuide';
import { SupportSection } from '../components/SupportSection';
import { CheckoutSheet } from '../components/CheckoutSheet';

export const HomePage: React.FC = () => {
  const { path, query, navigate } = useRouter();

  // Category, Provider, Destination, Nominal state
  const [category, setCategory] = useState<ProductCategory>('pulsa');
  const [provider, setProvider] = useState<ProviderItem>(
    PROVIDERS_BY_CATEGORY.pulsa[0]
  );
  const [destination, setDestination] = useState<string>('081234567890');
  const [nominal, setNominal] = useState<NominalItem>(
    NOMINALS_BY_CATEGORY.pulsa[4] // 25.000 POPULER
  );

  // Checkout flow state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [currentTransaction, setCurrentTransaction] = useState<TransactionRecord | null>(null);

  // Check URL query on homepage (e.g. /?category=pln&prov=pln-prabayar&nom=pln100)
  useEffect(() => {
    const catQuery = query.get('category') as ProductCategory;
    const provQuery = query.get('prov');
    const nomQuery = query.get('nom');
    if (catQuery && PROVIDERS_BY_CATEGORY[catQuery]) {
      handleCategoryChange(catQuery, provQuery || undefined, nomQuery || undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

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
    const catProviders = PROVIDERS_BY_CATEGORY[newCat] || [];
    let selectedProv = catProviders[0];
    if (forcedProviderId) {
      const match = catProviders.find((p) => p.id === forcedProviderId);
      if (match) selectedProv = match;
    }
    setProvider(selectedProv);

    const catNominals = NOMINALS_BY_CATEGORY[newCat] || [];
    let chosenNominal = catNominals.find((n) => n.badge === 'POPULER') || catNominals[0];
    if (forcedNominalId) {
      const nomMatch = catNominals.find((n) => n.id === forcedNominalId);
      if (nomMatch) chosenNominal = nomMatch;
    }
    setNominal(chosenNominal);
  };

  // Phone input with automatic provider detection
  const handleDestinationChange = (val: string) => {
    setDestination(val);
    setCheckoutError(null);
    if (category === 'pulsa' || category === 'data') {
      const detectedName = detectProviderFromPhone(val);
      const catProviders = PROVIDERS_BY_CATEGORY[category];
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

    const invoiceNum = 'INV-2025-' + Math.floor(10000 + Math.random() * 90000);
    const snNum = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}${timeStr.replace(':', '')}${Math.floor(100000 + Math.random() * 900000)}`;

    const tokenPlnNum =
      category === 'pln'
        ? `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
            1000 + Math.random() * 9000
          )}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
            1000 + Math.random() * 9000
          )}-${Math.floor(1000 + Math.random() * 9000)}`
        : undefined;

    const newTx: TransactionRecord = {
      id: 'tx-' + Date.now(),
      invoiceNumber: invoiceNum,
      categoryName: CATEGORIES_CONFIG[category].name,
      providerName: provider.name,
      nominalLabel: nominal.label,
      destination: destination || '081234567890',
      totalPrice: nominal.price,
      adminFee: 0,
      status: 'SUCCESS',
      createdAt: `Hari ini, ${timeStr} WIB`,
      serialNumber: snNum,
      tokenPln: tokenPlnNum,
    };

    setCurrentTransaction(newTx);
    setIsCheckoutOpen(true);
  };

  // Pembayaran sukses -> simpan pesanan ke private store (untuk halaman Cek Pesanan)
  const handleConfirmPayment = async (tx: TransactionRecord) => {
    const completedTx: TransactionRecord = { ...tx, status: 'SUCCESS' };
    setCurrentTransaction(completedTx);
    await saveOrder(completedTx);
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

