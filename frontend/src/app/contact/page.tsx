import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

export default function ContactPage() {
  return (
    <main>
      <header className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="nav-logo">TokDig</Link>
          <nav className="nav-links">
            <Link href="/products">Produk</Link>
            <Link href="/login" className="btn btn-primary btn-sm">Masuk</Link>
          </nav>
        </div>
      </header>

      <div className="container" style={{ maxWidth: '700px', padding: '40px 16px 80px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>📞 Hubungi Kami</h1>
        <p className="text-muted" style={{ marginBottom: '32px' }}>
          Punya pertanyaan atau butuh bantuan? Hubungi tim {APP_NAME} melalui salah satu kanal berikut.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📧</div>
            <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>Email</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-primary)' }}>support@tokdig.com</p>
            <p className="text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>Respon dalam 1x24 jam</p>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
            <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>WhatsApp</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-secondary)' }}>+62 812-3456-7890</p>
            <p className="text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>Online 09.00 - 22.00 WIB</p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '12px' }}>📩 Kirim Pesan</h3>
          <div className="form-group">
            <label className="form-label">Nama</label>
            <input type="text" className="form-input" placeholder="Nama Anda" id="contact-name" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="email@contoh.com" id="contact-email" />
          </div>
          <div className="form-group">
            <label className="form-label">Subjek</label>
            <select className="form-input" id="contact-subject">
              <option value="">Pilih subjek</option>
              <option value="order">Pertanyaan Pesanan</option>
              <option value="product">Pertanyaan Produk</option>
              <option value="payment">Masalah Pembayaran</option>
              <option value="claim">Klaim / Garansi</option>
              <option value="other">Lainnya</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Pesan</label>
            <textarea className="form-input" rows={5} placeholder="Tulis pesan Anda..." id="contact-message" />
          </div>
          <button className="btn btn-primary">Kirim Pesan →</button>
        </div>

        <div className="card" style={{ background: 'rgba(108, 92, 231, 0.04)', borderColor: 'rgba(108, 92, 231, 0.15)' }}>
          <h4 style={{ fontWeight: 600, marginBottom: '8px' }}>💡 Tips</h4>
          <ul style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '20px' }}>
            <li>Untuk masalah pesanan, sertakan nomor pesanan Anda</li>
            <li>Cek halaman <Link href="/faq" style={{ color: 'var(--color-primary)' }}>FAQ</Link> untuk jawaban cepat</li>
            <li>Jika sudah login, gunakan fitur <Link href="/dashboard/support" style={{ color: 'var(--color-primary)' }}>Bantuan</Link> di dashboard</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
