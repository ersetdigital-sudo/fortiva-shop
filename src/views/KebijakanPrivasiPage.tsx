'use client';


import React from 'react';
import { Link } from '../router';

export const KebijakanPrivasiPage: React.FC = () => {
  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-navy transition-colors">
          Beranda
        </Link>
        <span>/</span>
        <span className="text-brand-navy font-semibold">Kebijakan Privasi</span>
      </nav>

      {/* Header */}
      <div className="max-w-3xl mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
          Kebijakan Privasi
        </h1>
        <p className="text-sm text-stone-500 mt-2">
          Komitmen Fortiva Shop dalam melindungi keamanan dan kerahasiaan data transaksi Anda
        </p>
      </div>

      {/* Document Body */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-10 shadow-xs max-w-4xl space-y-8 text-xs text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-brand-navy">1. Perlindungan Privasi Pelanggan</h2>
          <p>
            Privasi Anda merupakan prioritas mutlak kami. Fortiva Shop menerapkan prinsip minimalisasi data, di mana kami hanya memproses informasi yang benar-benar esensial untuk memfasilitasi pengisian saldo, token, dan penerbitan faktur transaksi.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-brand-navy">2. Penyembunyian dan Masking Nomor Tujuan</h2>
          <p>
            Untuk mencegah pihak lain mengintip atau mengekstrak data nomor telepon maupun ID pelanggan secara massal, seluruh tampilan nomor tujuan pada riwayat publik dan faktur yang diakses publik disamarkan (masking), contoh: <code>0812 •••• 7890</code>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-brand-navy">3. Mekanisme Verifikasi Halaman Cek Pesanan</h2>
          <p>
            Pada halaman Cek Pesanan, sistem Fortiva Shop mewajibkan pencocokan ganda antara Nomor Invoice dengan Nomor Handphone/Meter tujuan transaksi. Hal ini memastikan bahwa data faktur hanya dapat ditampilkan kepada pengguna yang mengetahui informasi spesifik transaksi tersebut.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-brand-navy">4. Keamanan Transaksi dan Enkripsi</h2>
          <p>
            Seluruh data yang dikomunikasikan antara browser Anda dan sistem gateway kami dienkripsi menggunakan protokol Transport Layer Security (TLS 256-bit). Kami tidak menyimpan kredensial perbankan, PIN, atau data kartu pengguna.
          </p>
        </section>

        <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
          <Link href="/" className="text-xs font-bold text-brand-blue hover:underline">
            ← Kembali ke Beranda
          </Link>
          <Link href="/syarat-ketentuan" className="text-xs font-bold text-stone-600 hover:text-brand-navy">
            Baca Syarat &amp; Ketentuan →
          </Link>
        </div>
      </div>
    </div>
  );
};
