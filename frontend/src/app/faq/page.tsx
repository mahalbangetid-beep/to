'use client';

import { useState } from 'react';
import Link from 'next/link';

const FAQ_SECTIONS = [
  {
    title: '🛒 Pembelian',
    items: [
      {
        q: 'Bagaimana cara membeli produk digital di TokDig?',
        a: 'Pilih produk yang diinginkan, pilih paket/varian, isi form yang diperlukan, lalu lanjutkan ke pembayaran. Anda bisa membayar dengan berbagai metode seperti QRIS, GoPay, Transfer Bank, dll.',
      },
      {
        q: 'Apakah harus daftar akun untuk membeli?',
        a: 'Tidak wajib. Anda bisa checkout sebagai guest dengan memasukkan email. Namun, dengan akun Anda bisa melacak pesanan dan melihat riwayat pembelian.',
      },
      {
        q: 'Berapa lama proses pengiriman setelah pembayaran?',
        a: 'Sebagian besar produk dikirim otomatis dalam hitungan menit setelah pembayaran dikonfirmasi. Beberapa produk mungkin membutuhkan proses manual 1-24 jam.',
      },
    ],
  },
  {
    title: '💳 Pembayaran',
    items: [
      {
        q: 'Metode pembayaran apa saja yang tersedia?',
        a: 'Kami mendukung QRIS, GoPay, OVO, Dana, ShopeePay, Transfer Bank (BCA, BNI, BRI, Mandiri), serta pembayaran di Indomaret dan Alfamart.',
      },
      {
        q: 'Apakah pembayaran aman?',
        a: 'Ya, semua transaksi diproses melalui Midtrans, payment gateway berlisensi Bank Indonesia. Data Anda terenkripsi dan aman.',
      },
      {
        q: 'Bagaimana jika pembayaran sudah dilakukan tapi pesanan belum masuk?',
        a: 'Biasanya pembayaran terkonfirmasi dalam 1-5 menit. Jika lebih dari 30 menit, silakan hubungi CS kami melalui WhatsApp.',
      },
    ],
  },
  {
    title: '📦 Produk & Akses',
    items: [
      {
        q: 'Bagaimana cara mengakses produk yang sudah dibeli?',
        a: 'Cek email konfirmasi atau masuk ke Dashboard > Produk Saya. Detail akses (email, password, link) akan tersedia setelah pesanan selesai.',
      },
      {
        q: 'Berapa lama masa berlaku produk?',
        a: 'Tergantung paket yang dipilih. Setiap varian produk mencantumkan masa berlaku (1 bulan, 3 bulan, 6 bulan, dll).',
      },
      {
        q: 'Apakah bisa memperpanjang langganan?',
        a: 'Ya, Anda bisa membeli paket baru kapan saja. Durasi akan ditambahkan ke sisa waktu aktif.',
      },
    ],
  },
  {
    title: '🔒 Garansi & Refund',
    items: [
      {
        q: 'Apakah ada garansi produk?',
        a: 'Ya, setiap produk memiliki garansi sesuai yang tertulis di halaman produk. Jika produk tidak berfungsi sesuai deskripsi, Anda bisa mengajukan klaim.',
      },
      {
        q: 'Bagaimana cara mengajukan refund?',
        a: 'Hubungi CS kami melalui WhatsApp dengan menyertakan nomor pesanan. Refund diproses dalam 1-3 hari kerja sesuai kebijakan refund.',
      },
      {
        q: 'Apakah semua produk bisa di-refund?',
        a: 'Refund diberikan jika produk tidak sesuai deskripsi atau terdapat masalah teknis. Produk yang sudah dipakai atau diakses mungkin tidak memenuhi syarat refund.',
      },
    ],
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleItem = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <main>
      <header className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="nav-logo">TokDig</Link>
          <nav className="nav-links">
            <Link href="/products">Produk</Link>
            <Link href="/faq">FAQ</Link>
          </nav>
        </div>
      </header>

      <div className="container" style={{ maxWidth: '720px', padding: '40px 16px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
            Pertanyaan Umum
          </h1>
          <p className="text-muted" style={{ fontSize: '15px' }}>
            Temukan jawaban untuk pertanyaan yang sering ditanyakan
          </p>
        </div>

        {FAQ_SECTIONS.map((section, si) => (
          <div key={si} style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
              {section.title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {section.items.map((item, qi) => {
                const key = `${si}-${qi}`;
                const isOpen = openIndex === key;
                return (
                  <div
                    key={key}
                    className="card"
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => toggleItem(key)}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, paddingRight: '16px' }}>
                        {item.q}
                      </span>
                      <span style={{
                        fontSize: '18px',
                        transform: isOpen ? 'rotate(45deg)' : 'none',
                        transition: 'transform 0.2s',
                        flexShrink: 0,
                      }}>
                        +
                      </span>
                    </div>
                    {isOpen && (
                      <p style={{
                        marginTop: '12px',
                        fontSize: '14px',
                        lineHeight: '1.7',
                        color: 'var(--color-text-secondary)',
                      }}>
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Still need help */}
        <div className="card" style={{ textAlign: 'center', marginTop: '40px', padding: '32px' }}>
          <p style={{ fontSize: '20px', marginBottom: '8px' }}>🤔</p>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
            Masih punya pertanyaan?
          </h3>
          <p className="text-muted text-sm" style={{ marginBottom: '16px' }}>
            Hubungi tim support kami
          </p>
          <a
            href="https://wa.me/6281234567890?text=Halo%20TokDig,%20saya%20butuh%20bantuan"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-success"
          >
            💬 Chat WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
