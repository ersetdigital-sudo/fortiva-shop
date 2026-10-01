'use client';


import React from 'react';
import { Link } from '../router';

export const SyaratKetentuanPage: React.FC = () => {
  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-navy transition-colors">
          Beranda
        </Link>
        <span>/</span>
        <span className="text-brand-navy font-semibold">Syarat &amp; Ketentuan Layanan</span>
      </nav>

      {/* Header */}
      <div className="max-w-3xl mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
          Syarat &amp; Ketentuan Layanan
        </h1>
        <p className="text-sm text-stone-500 mt-2">
          Terakhir diperbarui: 1 Oktober 2026 · Berlaku untuk seluruh pengguna platform Fortiva Shop
        </p>
      </div>

      {/* Document Body */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-10 shadow-xs max-w-4xl space-y-8 text-xs text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-brand-navy">1. Ketentuan Umum</h2>
          <p>
            Selamat datang di <strong>Fortiva Shop</strong>. Dengan mengakses dan menggunakan platform digital kami untuk melakukan pembelian pulsa, paket data, token listrik PLN, pembayaran tagihan, atau pengisian saldo e-wallet, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan yang tercantum pada halaman ini.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-brand-navy">2. Transaksi dan Tanggung Jawab Data Tujuan</h2>
          <p>
            Pengguna bertanggung jawab penuh atas kebenaran dan keakuratan nomor handphone, nomor meter PLN, ID pelanggan, atau nomor kontrak tagihan yang dimasukkan ke dalam sistem Fortiva Shop.
          </p>
          <p>
            Kesalahan penulisan nomor tujuan yang mengakibatkan produk terkirim ke pihak yang salah tidak dapat dibatalkan atau ditarik kembali oleh sistem biller.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-brand-navy">3. Pembayaran Melalui QRIS</h2>
          <p>
            Pembayaran dilakukan menggunakan kode QRIS Dinamis standar nasional. Setiap kode QR yang diterbitkan memiliki batas waktu pembayaran (time-out) tertentu. Pengguna wajib menyelesaikan pembayaran sebelum masa berlaku kode QR berakhir agar faktur transaksi dapat diverifikasi secara otomatis oleh sistem gateway perbankan.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-brand-navy">4. Gangguan Provider dan Kebijakan Refund</h2>
          <p>
            Apabila terjadi gangguan koneksi pada pihak operator telekomunikasi atau server PLN yang menyebabkan transaksi berstatus gagal namun dana pengguna telah terpotong, tim bantuan kami akan melakukan rekonsiliasi dan memproses pengembalian dana (refund) sesuai bukti transaksi resmi.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-brand-navy">5. Kontak Bantuan</h2>
          <p>
            Untuk pertanyaan atau permohonan klarifikasi terkait transaksi Anda, silakan hubungi tim Customer Service resmi Fortiva Shop melalui WhatsApp pada jam operasional 08.00 – 22.00 WIB.
          </p>
        </section>

        <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
          <Link href="/" className="text-xs font-bold text-brand-blue hover:underline">
            ← Kembali ke Beranda
          </Link>
          <Link href="/kebijakan-privasi" className="text-xs font-bold text-stone-600 hover:text-brand-navy">
            Baca Kebijakan Privasi →
          </Link>
        </div>
      </div>
    </div>
  );
};
