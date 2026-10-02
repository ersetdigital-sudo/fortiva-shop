'use client';

import React, { createContext, useContext } from 'react';
import { FALLBACK_CATALOG, type Catalog } from './catalog-types';

const CatalogContext = createContext<Catalog>(FALLBACK_CATALOG);

/**
 * Menyediakan katalog (dari Supabase) ke seluruh komponen client.
 * Kalau provider tidak ada, komponen otomatis memakai data statis.
 */
export function CatalogProvider({
  catalog,
  children,
}: {
  catalog: Catalog;
  children: React.ReactNode;
}) {
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): Catalog {
  return useContext(CatalogContext);
}
