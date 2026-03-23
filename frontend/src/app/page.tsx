import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

// ─── DATA (static content that doesn't change) ──────

const heroData = {
  title: 'Produk Digital Premium',
  subtitle: 'dengan Harga Terjangkau',
  description: 'AI Premium, VPS, Digital Account, Voucher Game — semua yang kamu butuhkan dalam satu platform terpercaya.',
};

const trustItems = [
  { icon: '🛡️', title: 'Keamanan Terjamin', desc: 'Data dan akun Anda dilindungi enkripsi end-to-end' },
  { icon: '⚡', title: 'Pengiriman Cepat', desc: 'Produk otomatis dikirim 1-12 jam setelah pembayaran' },
  { icon: '🔄', title: 'Garansi Replacement', desc: 'Ganti gratis jika produk bermasalah selama masa aktif' },
  { icon: '💬', title: 'Support 24/7', desc: 'Tim CS siap membantu via WhatsApp dan tiket support' },
];

const faqItems = [
  { q: 'Bagaimana cara membeli produk?', a: 'Pilih produk, isi data yang diperlukan, lakukan pembayaran via QRIS/e-wallet/bank transfer, dan terima produk di dashboard.' },
  { q: 'Apakah akun yang dijual legal?', a: 'Semua akun yang kami jual berasal dari sumber resmi dan legal. Kami memberikan garansi penuh selama masa aktif.' },
  { q: 'Berapa lama proses pengiriman?', a: 'Tergantung tipe produk. Produk otomatis dikirim instan (1-5 menit), semi-auto 1-12 jam, dan manual 1-24 jam.' },
  { q: 'Bagaimana jika akun bermasalah?', a: 'Hubungi CS kami atau buat tiket support. Kami berikan replacement gratis selama masih dalam masa garansi.' },
  { q: 'Metode pembayaran apa saja yang tersedia?', a: 'QRIS, GoPay, OVO, Dana, ShopeePay, Transfer Bank (BCA, BNI, BRI, Mandiri), dan Indomaret/Alfamart.' },
];

// ─── Fallbacks (shown if API is down) ──────

const fallbackCategories = [
  { icon: '🤖', name: 'AI Premium', slug: 'ai-premium' },
  { icon: '🖥️', name: 'VPS', slug: 'vps' },
  { icon: '👤', name: 'Digital Account', slug: 'digital-account' },
  { icon: '🌐', name: 'Jasa Web', slug: 'jasa-web' },
  { icon: '🎮', name: 'Game Item', slug: 'game-item' },
  { icon: '🎫', name: 'Voucher', slug: 'voucher' },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
}

// ─── SERVER SIDE DATA FETCHING ──────

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function getCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 300 } });
    if (!res.ok) return fallbackCategories;
    const json = await res.json();
    const inner = json?.data || json;
    const cats = inner?.categories || inner;
    return Array.isArray(cats) ? cats : fallbackCategories;
  } catch {
    return fallbackCategories;
  }
}

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${API_URL}/products/featured?limit=5`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    const inner = json?.data || json;
    const products = inner?.products || inner;
    return Array.isArray(products) ? products : [];
  } catch {
    return [];
  }
}

// ─── PAGE ─────────────────────────────────────────────────

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ]);

  return (
    <main>
      {/* ─── NAVBAR ─────────────────────── */}
      <header className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="nav-logo">TokDig</Link>
          <nav className="nav-links">
            <Link href="/products">Produk</Link>
            <Link href="/login" className="btn btn-primary btn-sm">Masuk</Link>
          </nav>
        </div>
      </header>

      {/* ─── HERO ─────────────────────── */}
      <section className="hero">
        <div className="hero-bg-elements">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge">🚀 Platform Digital #1 di Indonesia</div>
          <h1 className="hero-title">
            {heroData.title}
            <span className="hero-title-gradient"> {heroData.subtitle}</span>
          </h1>
          <p className="hero-desc">{heroData.description}</p>
          <div className="hero-actions">
            <Link href="/products" className="btn btn-primary btn-lg">
              Lihat Produk →
            </Link>
            <Link href="/register" className="btn btn-secondary btn-lg">
              Daftar Gratis
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-number">2,500+</span>
              <span className="hero-stat-label">Produk Terjual</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">1,200+</span>
              <span className="hero-stat-label">Customer Puas</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">99.9%</span>
              <span className="hero-stat-label">Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ──────────────────── */}
      <section className="section" id="categories">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Kategori Produk</h2>
            <p className="section-desc">Pilih kategori yang kamu butuhkan</p>
          </div>
          <div className="category-grid">
            {categories.map((cat: any) => (
              <Link href={`/products?category=${cat.slug}`} key={cat.slug} className="category-card card card-hover">
                <span className="category-icon">{cat.icon || '📁'}</span>
                <div className="category-info">
                  <h3 className="category-name">{cat.name}</h3>
                  {cat.productCount !== undefined && (
                    <span className="category-count">{cat.productCount} produk</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ────────────── */}
      {featuredProducts.length > 0 && (
        <section className="section section-alt" id="featured">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Produk Terlaris 🔥</h2>
              <Link href="/products" className="section-link">Lihat Semua →</Link>
            </div>
            <div className="product-grid">
              {featuredProducts.map((product: any) => {
                const lowestPrice = product.variants?.length
                  ? Math.min(...product.variants.map((v: any) => Number(v.price)))
                  : Number(product.basePrice);
                const originalPrice = product.variants?.find((v: any) => v.originalPrice)?.originalPrice;

                return (
                  <Link href={`/products/${product.slug}`} key={product.id || product.slug} className="product-card card card-hover">
                    <div className="product-card-top">
                      <span className="product-type-badge">{product.category?.name || product.type}</span>
                      {product.badges?.length > 0 && (
                        <div className="product-badges">
                          {product.badges.map((b: string, i: number) => <span key={i}>{b}</span>)}
                        </div>
                      )}
                    </div>
                    <h3 className="product-card-name">{product.name}</h3>
                    <div className="product-card-meta">
                      <span className="product-sold">{(product.totalSold || 0).toLocaleString()} terjual</span>
                    </div>
                    <div className="product-card-price">
                      <span className="price-current">{formatPrice(lowestPrice)}</span>
                      {originalPrice && (
                        <span className="price-original">{formatPrice(originalPrice)}</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── TRUST SECTION ────────────────── */}
      <section className="section" id="why-us">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Kenapa Pilih TokDig?</h2>
            <p className="section-desc">Kami berkomitmen memberikan layanan terbaik</p>
          </div>
          <div className="trust-grid">
            {trustItems.map((item, i) => (
              <div key={i} className="trust-card card">
                <span className="trust-icon">{item.icon}</span>
                <h3 className="trust-title">{item.title}</h3>
                <p className="trust-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────── */}
      <section className="section section-alt" id="faq">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Pertanyaan Umum (FAQ)</h2>
          </div>
          <div className="faq-list">
            {faqItems.map((item, i) => (
              <details key={i} className="faq-item card">
                <summary className="faq-question">{item.q}</summary>
                <p className="faq-answer">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────── */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card card card-glass">
            <h2 className="cta-title">Siap Mulai Belanja?</h2>
            <p className="cta-desc">Daftar sekarang dan dapatkan akses ke semua produk digital premium kami.</p>
            <div className="cta-actions">
              <Link href="/register" className="btn btn-primary btn-lg">Daftar Gratis →</Link>
              <Link href="/products" className="btn btn-secondary btn-lg">Lihat Produk</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <span className="footer-logo">TokDig</span>
              <p className="footer-tagline">Platform toko online digital product terpercaya di Indonesia.</p>
            </div>
            <div className="footer-links">
              <h4>Produk</h4>
              <Link href="/products?category=ai-premium">AI Premium</Link>
              <Link href="/products?category=vps">VPS</Link>
              <Link href="/products?category=digital-account">Digital Account</Link>
              <Link href="/products?category=game-item">Game Item</Link>
            </div>
            <div className="footer-links">
              <h4>Informasi</h4>
              <Link href="/faq">FAQ</Link>
              <Link href="/terms">Syarat & Ketentuan</Link>
              <Link href="/privacy">Kebijakan Privasi</Link>
              <Link href="/contact">Hubungi Kami</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 {APP_NAME}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
