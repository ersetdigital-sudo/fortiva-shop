import type { Metadata, Viewport } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'Fortiva Shop | Marketplace Produk Digital & PPOB',
  description:
    'Fortiva Shop menyediakan pulsa, paket data, token PLN, uang elektronik, dan pembayaran tagihan. Transaksi praktis dengan pembayaran QRIS.',
  keywords: [
    'marketplace produk digital',
    'PPOB',
    'pulsa',
    'paket data',
    'token PLN',
    'pembayaran PLN',
    'PDAM',
    'BPJS',
    'pembayaran internet',
    'uang elektronik',
    'multifinance',
    'QRIS',
  ],
  openGraph: {
    title: 'Fortiva Shop | Kebutuhan Digital dalam Satu Tempat',
    description:
      'Pulsa, paket data, PLN, uang elektronik, dan berbagai pembayaran tagihan. Pilih produk dan bayar praktis melalui QRIS.',
    type: 'website',
    siteName: 'Fortiva Shop',
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fortiva Shop | Kebutuhan Digital dalam Satu Tempat',
    description:
      'Pulsa, paket data, PLN, uang elektronik, dan berbagai pembayaran tagihan. Pilih produk dan bayar praktis melalui QRIS.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Wajib agar env(safe-area-inset-*) aktif di iOS (notch / home indicator)
  viewportFit: 'cover',
  themeColor: '#F7F6F2',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-[#F7F6F2] text-[#111827] antialiased">
        {/* Google Fonts (React 19 hoists these <link> tags into <head>) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        />
        {children}
      </body>
    </html>
  );
}
