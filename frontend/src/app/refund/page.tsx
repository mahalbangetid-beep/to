import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kebijakan Refund',
  description: 'Kebijakan refund dan pengembalian dana TokDig. Pelajari syarat dan proses refund.',
};

export default function RefundPage() {
  return (
    <main>
      <header className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="nav-logo">TokDig</Link>
          <nav className="nav-links"><Link href="/products">Produk</Link></nav>
        </div>
      </header>

      <div className="container" style={{ maxWidth: '720px', padding: '40px 16px 80px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>💰 Kebijakan Refund</h1>

        <div style={{ fontSize: '14px', lineHeight: '1.8', color: 'var(--color-text-secondary)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: 'var(--color-text)' }}>Syarat Refund</h2>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li>Produk tidak sesuai deskripsi</li>
            <li>Akun tidak bisa digunakan sejak awal</li>
            <li>Terjadi kesalahan teknis dari pihak TokDig</li>
          </ul>

          <h2 style={{ fontSize: '18px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: 'var(--color-text)' }}>Tidak Memenuhi Syarat Refund</h2>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li>Produk sudah digunakan atau diakses</li>
            <li>Pembeli mengubah password/email akun yang diterima</li>
            <li>Permintaan refund setelah 7 hari dari tanggal pembelian</li>
            <li>Kesalahan dari pihak pembeli (salah pilih produk, dll)</li>
          </ul>

          <h2 style={{ fontSize: '18px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: 'var(--color-text)' }}>Proses</h2>
          <p>1. Hubungi CS melalui WhatsApp dengan menyertakan nomor pesanan dan bukti masalah.</p>
          <p>2. Tim kami akan meninjau dalam 1×24 jam.</p>
          <p>3. Jika disetujui, refund diproses dalam 1-3 hari kerja ke metode pembayaran asal.</p>

          <div className="card" style={{ marginTop: '24px', textAlign: 'center', padding: '24px' }}>
            <p style={{ marginBottom: '12px' }}>Butuh refund? Hubungi kami:</p>
            <a
              href="https://wa.me/6281234567890?text=Halo%20TokDig,%20saya%20ingin%20mengajukan%20refund"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-success"
            >
              💬 WhatsApp CS
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
