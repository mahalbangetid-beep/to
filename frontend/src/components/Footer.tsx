import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          {/* Brand */}
          <div>
            <div className="footer-brand">TokDig</div>
            <p style={{ lineHeight: '1.6', maxWidth: '280px' }}>
              Platform toko online digital product terpercaya. Produk premium dengan harga terjangkau dan garansi.
            </p>
          </div>

          {/* Produk */}
          <div>
            <div style={{ fontWeight: 600, marginBottom: '12px', color: 'var(--color-text)' }}>Produk</div>
            <div className="footer-links">
              <Link href="/products?category=ai-premium">AI Premium</Link>
              <Link href="/products?category=vps">VPS</Link>
              <Link href="/products?category=digital-account">Digital Account</Link>
              <Link href="/products?category=game-item">Game Item</Link>
              <Link href="/products?category=voucher">Voucher</Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <div style={{ fontWeight: 600, marginBottom: '12px', color: 'var(--color-text)' }}>Support</div>
            <div className="footer-links">
              <Link href="/faq">FAQ</Link>
              <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <div style={{ fontWeight: 600, marginBottom: '12px', color: 'var(--color-text)' }}>Legal</div>
            <div className="footer-links">
              <Link href="/terms">Syarat & Ketentuan</Link>
              <Link href="/privacy">Kebijakan Privasi</Link>
              <Link href="/refund">Kebijakan Refund</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} TokDig. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
