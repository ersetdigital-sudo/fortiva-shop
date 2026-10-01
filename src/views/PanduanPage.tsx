'use client';

import React, { useState } from 'react';
import { Link } from '../router';

import { Icon, IconName } from '../components/icons';

const TOC = [
  { id: 'alur', label: 'Alur dasar pembayaran' },
  { id: 'per-aplikasi', label: 'Petunjuk per aplikasi' },
  { id: 'nominal', label: 'Nominal & status' },
  { id: 'kendala', label: 'Jika pesanan belum masuk' },
];

const FLOW: { title: string; body: string; icon: IconName; tone: string }[] = [
  {
    title: 'Buka menu Scan QRIS',
    body: 'Buka aplikasi perbankan atau e-wallet pilihan Anda, lalu pilih fitur Pindai / Scan QRIS. Jika bertransaksi dari ponsel yang sama, simpan gambarnya (screenshot) lalu unggah dari galeri.',
    icon: 'qr_code_scanner',
    tone: 'bg-red-50 text-brand-red',
  },
  {
    title: 'Pastikan merchant & nominal',
    body: 'Periksa layar konfirmasi aplikasi Anda: nama merchant resmi adalah FORTIVA DIGITAL. Pastikan total nominal sesuai tagihan pesanan Anda.',
    icon: 'price_check',
    tone: 'bg-blue-50 text-brand-blue',
  },
  {
    title: 'Konfirmasi PIN & selesai',
    body: 'Masukkan PIN keamanan Anda. Setelah konfirmasi berhasil, faktur pembayaran dan nomor seri (SN) atau token langsung bisa diperiksa di Fortiva Shop.',
    icon: 'verified_user',
    tone: 'bg-emerald-50 text-brand-green',
  },
];

interface AppGuide {
  badge: string;
  badgeClass: string;
  name: string;
  steps: string[];
}

const BANKING: AppGuide[] = [
  {
    badge: 'BCA',
    badgeClass: 'bg-blue-600',
    name: 'BCA Mobile / myBCA',
    steps: [
      'Buka aplikasi BCA mobile atau myBCA.',
      'Pilih menu QRIS di bagian tengah bawah layar.',
      'Arahkan kamera ke barcode QRIS atau pilih unggah dari galeri.',
      'Periksa detail: nama penerima FORTIVA DIGITAL.',
      'Masukkan PIN m-BCA Anda dan simpan bukti transaksi.',
    ],
  },
  {
    badge: 'LIVIN',
    badgeClass: 'bg-amber-500',
    name: "Livin' by Mandiri",
    steps: [
      "Buka aplikasi Livin' by Mandiri.",
      'Tekan menu QR Bayar.',
      'Scan barcode QRIS atau pilih screenshot dari galeri foto.',
      'Pastikan nominal dan nama penerima telah sesuai.',
      "Konfirmasi pembayaran dengan PIN Livin' Anda.",
    ],
  },
  {
    badge: 'BRI',
    badgeClass: 'bg-blue-700',
    name: 'BRImo (Bank BRI)',
    steps: [
      'Buka aplikasi BRImo di ponsel Anda.',
      'Tekan ikon QRIS pada halaman beranda.',
      'Scan kode atau unggah gambar barcode QRIS Fortiva Shop.',
      'Periksa nama merchant dan sumber rekening pendebetan.',
      'Masukkan PIN BRImo untuk menyelesaikan transaksi.',
    ],
  },
  {
    badge: 'BNI',
    badgeClass: 'bg-orange-600',
    name: 'BNI Mobile Banking',
    steps: [
      'Masuk ke aplikasi BNI Mobile Banking.',
      'Tekan tombol menu QRIS di bagian navigasi bawah.',
      'Arahkan kamera ke barcode QRIS atau pilih foto dari memori ponsel.',
      'Pastikan nama merchant tertera FORTIVA DIGITAL.',
      'Ketik Password Transaksi BNI Anda.',
    ],
  },
];

const EWALLET: AppGuide[] = [
  {
    badge: 'G',
    badgeClass: 'bg-cyan-600',
    name: 'GoPay (Gojek / GoPay)',
    steps: [
      'Buka aplikasi GoPay atau Gojek.',
      'Tekan menu Bayar (ikon scan QR).',
      'Arahkan kamera ke barcode QRIS Fortiva Shop.',
      'Periksa rincian penerima dan klik Konfirmasi & Bayar.',
      'Masukkan 6 digit PIN GoPay Anda.',
    ],
  },
  {
    badge: 'D',
    badgeClass: 'bg-blue-500',
    name: 'DANA Dompet Digital',
    steps: [
      'Buka aplikasi DANA.',
      'Pilih menu Pindai / Scan di layar atas.',
      'Arahkan kamera ke kode QRIS atau pilih dari galeri.',
      'Pastikan nominal pembayaran dan merchant sesuai.',
      'Tekan Bayar dan masukkan PIN DANA Anda.',
    ],
  },
  {
    badge: 'O',
    badgeClass: 'bg-purple-700',
    name: 'OVO',
    steps: [
      'Buka aplikasi OVO.',
      'Pilih menu QRIS di beranda aplikasi.',
      'Pindai barcode QRIS yang tampil di layar Fortiva Shop.',
      'Pilih sumber dana (OVO Cash).',
      'Tekan Bayar dan masukkan Security Code OVO.',
    ],
  },
  {
    badge: 'SP',
    badgeClass: 'bg-orange-500',
    name: 'ShopeePay',
    steps: [
      'Buka aplikasi Shopee lalu buka menu ShopeePay.',
      'Pilih menu Bayar / Kode QR.',
      'Scan barcode atau upload gambar dari galeri Anda.',
      'Periksa detail pembayaran dan klik Lanjutkan.',
      'Masukkan PIN ShopeePay Anda.',
    ],
  },
];

export const PanduanPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'banking' | 'ewallet'>('banking');
  const guides = activeTab === 'banking' ? BANKING : EWALLET;

  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 pt-6 pb-16 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 mb-5" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-navy transition-colors">
          Beranda
        </Link>
        <span className="text-stone-300">/</span>
        <span className="text-brand-navy font-semibold">Panduan Pembayaran QRIS</span>
      </nav>

      {/* Header */}
      <header className="mb-7 sm:mb-10 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[11px] font-bold text-brand-blue uppercase tracking-wider mb-3">
          <Icon name="qr_code_scanner" className="w-3.5 h-3.5" />
          Panduan Resmi Pembayaran QRIS
        </div>
        <h1 className="text-[28px] leading-[1.15] sm:text-4xl font-extrabold text-brand-navy tracking-tight">
          Panduan Pembayaran QRIS
        </h1>
        <p className="text-sm sm:text-base text-stone-600 mt-2 leading-relaxed">
          Pelajari tata cara menyelesaikan pembayaran menggunakan kode QRIS standar nasional di
          Fortiva Shop — lewat m-Banking perbankan maupun e-wallet resmi di Indonesia.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {['Tanpa biaya admin', 'Verifikasi detik', 'QRIS dinamis'].map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-600 bg-white border border-stone-200/90 rounded-full px-3 py-1"
            >
              <Icon name="check" className="w-3 h-3 text-brand-green" strokeWidth={3} />
              {t}
            </span>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* ---------- Daftar Isi ---------- */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <nav
            className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs"
            aria-label="Daftar isi"
          >
            <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400 mb-3">
              Daftar Isi
            </h2>
            <ol className="space-y-1">
              {TOC.map((t, i) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-50 hover:text-brand-navy transition-colors"
                  >
                    <span className="w-6 h-6 rounded-lg bg-stone-100 text-stone-500 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="min-w-0">{t.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Icon name="chat" className="w-4 h-4" />
              </span>
              <h3 className="text-xs font-extrabold text-brand-navy">Butuh bantuan?</h3>
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Belum yakin langkah berikutnya? Tim CS siap membantu verifikasi pembayaran kamu.
            </p>
            <a
              href="https://wa.me/6281234567890?text=Halo%20CS%20Fortiva%20Shop,%20saya%20butuh%20bantuan%20pembayaran%20QRIS"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Icon name="chat" className="w-4 h-4" />
              Chat CS WhatsApp
            </a>
          </div>
        </aside>

        {/* ---------- Konten ---------- */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Alur dasar (timeline) */}
          <section
            id="alur"
            className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-2xs scroll-mt-24"
          >
            <div className="flex items-center gap-2.5 mb-5">
              <span className="w-8 h-8 rounded-lg bg-red-50 text-brand-red flex items-center justify-center text-xs font-bold num-tabular shrink-0">
                01
              </span>
              <h2 className="text-base font-extrabold text-brand-navy">Alur Dasar Pembayaran QRIS</h2>
            </div>

            <ol>
              {FLOW.map((s, i) => {
                const isLast = i === FLOW.length - 1;
                return (
                  <li key={s.title} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={`w-9 h-9 rounded-xl ${s.tone} flex items-center justify-center shrink-0`}
                      >
                        <Icon name={s.icon} className="w-5 h-5" />
                      </span>
                      {!isLast && (
                        <span className="w-0.5 flex-1 my-1.5 bg-stone-200 rounded-full" />
                      )}
                    </div>
                    <div className={`min-w-0 ${isLast ? 'pb-0' : 'pb-5'}`}>
                      <span className="text-[10px] font-extrabold text-stone-400 tracking-wider num-tabular">
                        LANGKAH {i + 1}
                      </span>
                      <h3 className="text-sm font-bold text-brand-navy mt-0.5">{s.title}</h3>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">{s.body}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* 2. Petunjuk per aplikasi (tab) */}
          <section
            id="per-aplikasi"
            className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-2xs scroll-mt-24"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center text-xs font-bold num-tabular shrink-0">
                02
              </span>
              <h2 className="text-base font-extrabold text-brand-navy">Petunjuk Per Aplikasi</h2>
            </div>

            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-stone-100 mb-5">
              {(['banking', 'ewallet'] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`px-4 h-9 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === key
                      ? 'bg-white text-brand-navy shadow-xs'
                      : 'text-stone-500 hover:text-brand-navy'
                  }`}
                >
                  {key === 'banking' ? 'M-Banking' : 'E-Wallet'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {guides.map((g) => (
                <div
                  key={g.name}
                  className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2 animate-fade-up"
                >
                  <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2.5">
                    <span
                      className={`w-7 h-7 rounded-lg ${g.badgeClass} text-white flex items-center justify-center text-[9px] font-extrabold shrink-0 leading-none px-1`}
                    >
                      {g.badge}
                    </span>
                    <span className="min-w-0">{g.name}</span>
                  </h3>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-stone-600">
                    {g.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </section>

          {/* 3 & 4. Nominal + Status */}
          <section id="nominal" className="scroll-mt-24 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                <Icon name="price_check" className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-brand-navy">Memastikan Nominal Sesuai</h3>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Pada QRIS Dinamis Fortiva Shop, nominal tagihan otomatis tertanam di dalam kode QR.
                Anda tidak perlu mengetikkan angka pembayaran manual. Pastikan saldo rekening atau
                dompet digital mencukupi untuk total yang tertera.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-2xs flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center mb-3">
                <Icon name="search_check" className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-brand-navy">Memeriksa Status Transaksi</h3>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Setelah membayar di aplikasi perbankan atau e-wallet, buka halaman Cek Pesanan.
                Masukkan nomor invoice beserta nomor HP/meter tujuan untuk melihat status
                pengiriman, nomor seri (SN), atau token PLN Anda.
              </p>
              <Link
                href="/cek-pesanan"
                className="mt-auto pt-3 text-xs font-bold text-brand-blue hover:underline inline-flex items-center gap-1"
              >
                Buka Halaman Cek Pesanan
                <Icon name="arrow_forward" className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>

          {/* 5. Kendala */}
          <section
            id="kendala"
            className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-2xs scroll-mt-24"
          >
            <div className="flex items-center gap-2.5 mb-3.5">
              <span className="w-8 h-8 rounded-lg bg-red-50 text-brand-red flex items-center justify-center shrink-0">
                <Icon name="contact_support" className="w-4 h-4" />
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-brand-navy leading-snug">
                Pembayaran Berhasil tapi Pulsa / Token Belum Masuk?
              </h2>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Jika saldo perbankan Anda sudah terpotong namun status pesanan belum terupdate,
              berikut langkah yang disarankan:
            </p>
            <ul className="mt-3 space-y-2.5">
              <li className="flex gap-2.5 text-xs text-stone-600 leading-relaxed">
                <Icon name="check" className="w-3.5 h-3.5 mt-1 text-brand-green shrink-0" strokeWidth={3} />
                <span>
                  Buka halaman{' '}
                  <Link
                    href="/cek-pesanan"
                    className="text-brand-blue font-semibold hover:underline"
                  >
                    Cek Pesanan
                  </Link>{' '}
                  dan periksa apakah transaksi masih berstatus <em>Sedang Diproses</em> oleh biller.
                </span>
              </li>
              <li className="flex gap-2.5 text-xs text-stone-600 leading-relaxed">
                <Icon name="check" className="w-3.5 h-3.5 mt-1 text-brand-green shrink-0" strokeWidth={3} />
                <span>Pastikan nomor tujuan yang Anda input sudah aktif dan benar.</span>
              </li>
              <li className="flex gap-2.5 text-xs text-stone-600 leading-relaxed">
                <Icon name="check" className="w-3.5 h-3.5 mt-1 text-brand-green shrink-0" strokeWidth={3} />
                <span>Simpan bukti transfer dari aplikasi m-Banking atau e-wallet Anda.</span>
              </li>
              <li className="flex gap-2.5 text-xs text-stone-600 leading-relaxed">
                <Icon name="check" className="w-3.5 h-3.5 mt-1 text-brand-green shrink-0" strokeWidth={3} />
                <span>
                  Hubungi CS WhatsApp resmi Fortiva Shop dengan melampirkan nomor invoice dan
                  bukti transaksi Anda. Tim kami akan mengecek langsung ke provider.
                </span>
              </li>
            </ul>
          </section>

          {/* 6. CTA */}
          <div className="p-5 sm:p-7 rounded-3xl bg-[#FFE78F]/85 border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 text-brand-navy">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold">Siap Bertransaksi?</h3>
              <p className="text-xs text-stone-700 mt-1 max-w-lg">
                Jelajahi pulsa, paket data, token listrik PLN, hingga saldo e-wallet dengan
                pembayaran QRIS praktis.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link
                href="/#terminal"
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-brand-navy hover:bg-stone-800 text-white font-bold text-xs transition-colors shadow-xs text-center"
              >
                Kembali ke Katalog
              </Link>
              <a
                href="https://wa.me/6281234567890?text=Halo%20CS%20Fortiva%20Shop,%20saya%20butuh%20bantuan%20pembayaran%20QRIS"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs text-center"
              >
                Chat CS WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
