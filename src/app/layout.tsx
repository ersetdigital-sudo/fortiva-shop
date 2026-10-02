import type { Metadata, Viewport } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'Fortiva Shop · Lokapasar Produk Digital & PPOB Resmi',
  description:
    'Lokapasar Produk Digital dan PPOB Resmi di Indonesia. Transaksi pulsa, paket data, token PLN, e-wallet, dan pembayaran tagihan dengan QRIS instan.',
  openGraph: {
    title: 'Fortiva Shop · Lokapasar Produk Digital & PPOB Resmi',
    description:
      'Lokapasar Produk Digital dan PPOB Resmi di Indonesia. Transaksi pulsa, paket data, token PLN, e-wallet, dan pembayaran tagihan dengan QRIS instan.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
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
