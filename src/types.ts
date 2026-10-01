export type ProductCategory = 'pulsa' | 'data' | 'pln' | 'ewallet' | 'tagihan';

export interface ProviderItem {
  id: string;
  name: string;
  code: string;
  shortName: string;
  bgColor: string;
  textColor: string;
}

export interface NominalItem {
  id: string;
  label: string;
  description: string;
  price: number;
  badge?: 'POPULER' | 'HEMAT' | 'PROMO';
}

export interface TransactionRecord {
  id: string;
  invoiceNumber: string;
  categoryName: string;
  providerName: string;
  nominalLabel: string;
  destination: string;
  totalPrice: number;
  adminFee: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: string;
  serialNumber?: string;
  tokenPln?: string;
}
