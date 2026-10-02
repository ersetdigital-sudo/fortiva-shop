import type { NominalItem, ProviderItem } from '@/types';
import type { Catalog } from './catalog-types';

/**
 * Pencocokan toleran untuk referensi cepat (quick-select, deep-link, dsb).
 *
 * Panel seperti Hero & CategoriesGrid memakai penanda manusiawi
 * ("telkomsel", "pdam", "50.000"), sedangkan database memakai UUID.
 * Normalisasi membuat keduanya tetap nyambung.
 */

const normalize = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, '');

export function findProvider(
  catalog: Catalog,
  slug: string,
  hint?: string
): ProviderItem | undefined {
  const list = catalog.providersByCategory[slug] ?? [];
  const fallback = list[0];
  if (!hint) return fallback;

  const key = normalize(hint);
  if (!key) return fallback;

  return (
    list.find((item) => normalize(item.id) === key) ??
    list.find((item) => normalize(item.code) === key) ??
    list.find((item) => normalize(item.name) === key) ??
    list.find((item) => {
      const name = normalize(item.name);
      return name.length > 0 && (name.includes(key) || key.includes(name));
    }) ??
    fallback
  );
}

export function findNominal(
  catalog: Catalog,
  slug: string,
  hint?: string
): NominalItem | undefined {
  const list = catalog.nominalsByCategory[slug] ?? [];
  const fallback = list.find((item) => item.badge === 'POPULER') ?? list[0];
  if (!hint) return fallback;

  const key = normalize(hint);
  if (!key) return fallback;

  return (
    list.find((item) => normalize(item.id) === key) ??
    list.find((item) => normalize(item.label) === key) ??
    list.find((item) => {
      const label = normalize(item.label);
      return label.length > 0 && (label.includes(key) || key.includes(label));
    }) ??
    fallback
  );
}
