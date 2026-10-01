# Fortiva Shop

Lokapasar Produk Digital dan PPOB Resmi — dibangun dengan **Next.js (App Router)**, React 19, TypeScript, dan Tailwind CSS v4.

## Menjalankan Secara Lokal

**Prasyarat:** Node.js 20.9+ (disarankan 22/24)

1. Install dependency:
   `npm install`
2. Jalankan development server:
   `npm run dev`
3. Buka [http://localhost:3000](http://localhost:3000)

## Scripts

| Script              | Keterangan                              |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Menjalankan dev server di port 3000     |
| `npm run build`     | Build produksi (Next.js)                |
| `npm run start`     | Menjalankan hasil build produksi        |
| `npm run typecheck` | Cek tipe TypeScript (`tsc --noEmit`)    |

## Struktur

```
src/
  app/            # Next.js App Router (layout, routes)
  components/     # Komponen UI (Header, Hero, OrderTerminal, modals, dst.)
  views/          # Konten halaman per-route (HomePage, CekPesananPage, ...)
  data/           # Katalog produk (kategori, provider, nominal)
  services/       # Layanan pesanan (verifikasi & penyimpanan lokal)
  router.tsx      # Adapter Link/useRouter di atas next/navigation
  index.css       # Setup Tailwind v4 + token tema brand
  types.ts        # Tipe domain
```

> Catatan: `useSearchParams()` dipakai lewat adapter di `src/router.tsx`. Root layout
> (`src/app/layout.tsx`) menetapkan `export const dynamic = 'force-dynamic'` karena
> aplikasi ini sepenuhnya interaktif di sisi klien (state, `localStorage`, query URL).
