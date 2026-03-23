import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description: 'Kebijakan privasi TokDig — cara kami melindungi data pribadi pengguna.',
};

export default function PrivacyPage() {
  return (
    <main>
      <header className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="nav-logo">TokDig</Link>
          <nav className="nav-links"><Link href="/products">Produk</Link></nav>
        </div>
      </header>

      <div className="container" style={{ maxWidth: '720px', padding: '40px 16px 80px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>🔐 Kebijakan Privasi</h1>

        <div style={{ fontSize: '14px', lineHeight: '1.8', color: 'var(--color-text-secondary)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: 'var(--color-text)' }}>Data yang Dikumpulkan</h2>
          <p>Kami mengumpulkan informasi yang diperlukan untuk memproses pesanan: email, nomor telepon (opsional), dan data pembayaran. Data pembayaran diproses oleh Midtrans dan tidak disimpan di server kami.</p>

          <h2 style={{ fontSize: '18px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: 'var(--color-text)' }}>Penggunaan Data</h2>
          <p>Data digunakan untuk: memproses pesanan, mengirim konfirmasi, memberikan layanan pelanggan, dan meningkatkan pengalaman pengguna.</p>

          <h2 style={{ fontSize: '18px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: 'var(--color-text)' }}>Keamanan</h2>
          <p>Password di-hash dengan bcrypt. Semua komunikasi dienkripsi dengan SSL. Kami tidak pernah menyimpan data kartu kredit.</p>

          <h2 style={{ fontSize: '18px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: 'var(--color-text)' }}>Hak Pengguna</h2>
          <p>Anda berhak meminta penghapusan data pribadi dengan menghubungi CS kami. Data akan dihapus dalam 30 hari kerja.</p>

          <h2 style={{ fontSize: '18px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: 'var(--color-text)' }}>Cookies</h2>
          <p>Kami menggunakan cookies untuk otentikasi (JWT token) dan preferensi pengguna. Anda dapat menonaktifkan cookies di browser, namun beberapa fitur mungkin tidak berfungsi.</p>
        </div>
      </div>
    </main>
  );
}
