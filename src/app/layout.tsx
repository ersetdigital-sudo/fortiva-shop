import type { Metadata, Viewport } from 'next';
import '../index.css';
import { AppShell } from '../components/AppShell';

// This app is fully client-interactive (state, localStorage, URL query driven),
// so it is rendered on demand. This also allows `useSearchParams()` inside the
// client components without requiring extra Suspense boundaries.
export const dynamic = 'force-dynamic';

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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
