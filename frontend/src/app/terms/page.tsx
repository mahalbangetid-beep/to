import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan',
  description: 'Syarat dan ketentuan penggunaan layanan TokDig — platform toko digital product terpercaya.',
};

export default function TermsPage() {
  return (
    <main>
      <header className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="nav-logo">TokDig</Link>
          <nav className="nav-links"><Link href="/products">Produk</Link></nav>
        </div>
      </header>

      <div className="container" style={{ maxWidth: '720px', padding: '40px 16px 80px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>📜 Syarat & Ketentuan</h1>

        <div style={{ fontSize: '14px', lineHeight: '1.8', color: 'var(--color-text-secondary)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: 'var(--color-text)' }}>1. Umum</h2>
          <p>Dengan menggunakan layanan TokDig, Anda menyetujui syarat dan ketentuan yang berlaku. TokDig adalah platform marketplace produk digital yang menghubungkan penjual dan pembeli.</p>

          <h2 style={{ fontSize: '18px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: 'var(--color-text)' }}>2. Pembelian</h2>
          <p>Semua pembelian bersifat final setelah pembayaran dikonfirmasi. Produk digital akan dikirimkan sesuai metode yang telah ditentukan untuk masing-masing produk.</p>

          <h2 style={{ fontSize: '18px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: 'var(--color-text)' }}>3. Akun</h2>
          <p>Pengguna bertanggung jawab atas keamanan akun masing-masing. Jangan membagikan kredensial produk yang dibeli kepada pihak ketiga kecuali diizinkan.</p>

          <h2 style={{ fontSize: '18px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: 'var(--color-text)' }}>4. Larangan</h2>
          <p>Dilarang menggunakan layanan TokDig untuk aktivitas ilegal, menyalahgunakan produk, atau melanggar hak kekayaan intelektual.</p>

          <h2 style={{ fontSize: '18px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: 'var(--color-text)' }}>5. Perubahan</h2>
          <p>TokDig berhak mengubah syarat dan ketentuan sewaktu-waktu. Perubahan akan diinformasikan melalui email atau website.</p>
        </div>
      </div>
    </main>
  );
}
