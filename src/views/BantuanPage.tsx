'use client';


import React, { useState } from 'react';
import { Link } from '../router';

import { Icon } from '../components/icons';
import { useCatalog } from '../lib/catalog-context';
import { whatsappUrl } from '../lib/catalog-types';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const BantuanPage: React.FC = () => {
  const { settings } = useCatalog();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const faqs: FaqItem[] = [
    {
      category: 'Transaksi',
      question: 'Berapa lama pulsa atau paket data masuk setelah pembayaran selesai?',
      answer:
        'Pulsa dan paket kuota dikirim ke biller setelah pembayaran QRIS diverifikasi oleh tim kami.',
    },
    {
      category: 'Transaksi',
      question: 'Bagaimana jika saldo terpotong tapi pulsa belum bertambah?',
      answer:
        'Silakan periksa halaman Cek Pesanan dengan memasukkan nomor invoice dan nomor handphone Anda. Jika status transaksi mengalami gangguan pada provider operator, tim CS WhatsApp kami akan segera membantu pengecekan atau rekonsiliasi.',
    },
    {
      category: 'PLN',
      question: 'Di mana saya bisa melihat 20 digit nomor token listrik PLN yang dibeli?',
      answer:
        'Kode token 20 digit langsung ditampilkan di layar faktur sukses setelah pembayaran selesai. Anda juga dapat melihatnya kembali kapan saja melalui halaman Cek Pesanan dengan memasukkan nomor invoice dan ID meteran Anda.',
    },
    {
      category: 'PLN',
      question: 'Apakah pembelian token PLN dibatasi jam operasional?',
      answer:
        'Sistem PLN memiliki periode maintenance rutin harian sekitar pukul 23:30 hingga 00:30 WIB. Di luar jam tersebut, layanan token PLN aktif 24 jam nonstop.',
    },
    {
      category: 'Pembayaran',
      question: 'Apakah ada biaya admin tambahan untuk pembayaran via QRIS?',
      answer:
        'Tidak ada. Pembayaran QRIS di Fortiva Shop bebas biaya admin tambahan. Anda hanya membayar nominal total yang tertera di layar checkout.',
    },
    {
      category: 'Pembayaran',
      question: 'Aplikasi apa saja yang dapat digunakan untuk scan QRIS?',
      answer:
        'Aplikasi perbankan digital (BCA mobile, Livin Mandiri, BRImo, BNI, CIMB, dll) dan e-wallet yang mendukung QRIS (GoPay, DANA, OVO, ShopeePay, LinkAja) dapat digunakan untuk memindai kode QRIS Fortiva Shop.',
    },
    {
      category: 'Privasi',
      question: 'Mengapa halaman Cek Pesanan memerlukan nomor tujuan selain nomor invoice?',
      answer:
        'Ini adalah standar perlindungan privasi pelanggan Fortiva Shop untuk memastikan bahwa rincian transaksi hanya dapat diakses oleh pihak yang berhak dan tidak dapat diintip secara sembarangan oleh pihak lain.',
    },
  ];

  const categories = ['Semua', 'Transaksi', 'PLN', 'Pembayaran', 'Privasi'];

  const filteredFaqs =
    selectedCategory === 'Semua'
      ? faqs
      : faqs.filter((f) => f.category === selectedCategory);

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-navy transition-colors">
          Beranda
        </Link>
        <span>/</span>
        <span className="text-brand-navy font-semibold">Pusat Bantuan &amp; FAQ</span>
      </nav>

      {/* Header */}
      <div className="max-w-3xl mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-xs font-bold text-brand-green uppercase tracking-wider mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Layanan Bantuan Fortiva Shop
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
          Pusat Bantuan &amp; FAQ
        </h1>
        <p className="text-base text-stone-600 mt-2 leading-relaxed">
          Temukan panduan lengkap dan jawaban pertanyaan umum seputar pengisian pulsa, paket data,
          token listrik PLN, dan tata cara verifikasi transaksi Anda.
        </p>
      </div>

      {/* Quick Support Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
        <div className="bg-white rounded-2xl border border-stone-200/90 p-6 flex items-start gap-4 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center shrink-0">
            <Icon name="chat" className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-brand-navy">Customer Service WhatsApp</h2>
            <p className="text-xs text-stone-500 mt-1">
              Tim support teknis kami siap merespons kendala transaksi Anda setiap hari.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs font-semibold text-stone-700">08.00 – 22.00 WIB</span>
              <span className="text-stone-300">·</span>
              <a
                href={whatsappUrl(settings, 'Halo CS Fortiva Shop')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Mulai Chat Sekarang →
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/90 p-6 flex items-start gap-4 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center shrink-0">
            <Icon name="search_check" className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-brand-navy">Lacak Status Pesanan Mandiri</h2>
            <p className="text-xs text-stone-500 mt-1">
              Periksa status transaksi, SN biller, atau nomor token kWh secara realtime.
            </p>
            <div className="mt-3">
              <Link
                href="/cek-pesanan"
                className="text-xs font-bold text-brand-blue hover:underline"
              >
                Buka Halaman Cek Pesanan →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-10 shadow-xs mb-10">
        <h2 className="text-xl font-extrabold text-brand-navy mb-4">
          Pertanyaan yang Sering Diajukan (FAQ)
        </h2>

        {/* Filter categories */}
        <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-stone-100">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-brand-navy text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70 hover:text-brand-navy'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border border-stone-200/80 rounded-xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 bg-stone-50/50 hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-bold text-brand-navy">
                    {faq.question}
                  </span>
                  <span
                    className={`shrink-0 text-stone-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    <Icon name="expand_more" className="w-5 h-5" />
                  </span>
                </button>
                {isOpen && (
                  <div className="p-4 bg-white text-xs text-stone-600 leading-relaxed border-t border-stone-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
