'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { PRODUCT_TYPE_LABELS } from '@/lib/constants';
import { api } from '@/lib/api';

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  isRecommended?: boolean;
  durationDays?: number;
}

interface ProductField {
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  isRequired: boolean;
  placeholder: string;
}

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductData {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string;
  shortDesc: string;
  badges: string[];
  totalSold: number;
  slaText: string;
  warrantyInfo: string;
  rules: string;
  isFeatured: boolean;
  basePrice: number;
  images: string[];
  category: { name: string; slug: string } | null;
  variants: ProductVariant[];
  fields: ProductField[];
  benefits?: string[];
  howItWorks?: string[];
  faq?: Array<{ question: string; answer: string }>;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  // Reviews
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [avgRating, setAvgRating] = useState(0);

  // Wishlist
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await api.get<{ data: ProductData }>(`/products/${slug}`);
        const p = (res as any).data || res;
        setProduct(p);

        // Load reviews
        try {
          const revRes = await api.get<{ data: { reviews: ReviewItem[] } }>(`/reviews/product/${p.id}`);
          setReviews((revRes as any).data?.reviews || (revRes as any).reviews || []);
        } catch { /* skip */ }

        // Load avg rating
        try {
          const ratingRes = await api.get<{ data: { average: number } }>(`/reviews/product/${p.id}/rating`);
          setAvgRating((ratingRes as any).data?.average || (ratingRes as any).average || 0);
        } catch { /* skip */ }

        // Check wishlist
        try {
          const wishRes = await api.get<{ data: { inWishlist: boolean } }>(`/wishlist/${p.id}/check`);
          setInWishlist((wishRes as any).data?.inWishlist || (wishRes as any).inWishlist || false);
        } catch { /* skip — not logged in */ }
      } catch (err: any) {
        setError('Produk tidak ditemukan');
      }
      setLoading(false);
    };
    loadProduct();
  }, [slug]);

  const handleToggleWishlist = async () => {
    if (!product) return;
    setWishlistLoading(true);
    try {
      const res = await api.post<{ data: { added: boolean } }>(`/wishlist/${product.id}/toggle`, {});
      setInWishlist((res as any).data?.added ?? (res as any).added ?? !inWishlist);
    } catch {
      // Not logged in — redirect
      router.push('/login');
    }
    setWishlistLoading(false);
  };

  const handleBuyNow = () => {
    if (!product) return;
    const variantParam = selectedVariant ? `&variant=${selectedVariant}` : '';
    router.push(`/checkout?product=${product.slug}${variantParam}`);
  };

  if (loading) {
    return (
      <main>
        <header className="navbar">
          <div className="container navbar-inner">
            <Link href="/" className="nav-logo">TokDig</Link>
            <nav className="nav-links"><Link href="/products">Produk</Link></nav>
          </div>
        </header>
        <div style={{ textAlign: 'center', padding: '80px' }}>
          <div className="spinner spinner-dark" style={{ width: 40, height: 40, margin: '0 auto' }} />
        </div>
      </main>
    );
  }

  if (error || !product) {
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
        <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</p>
          <h2 style={{ marginBottom: '8px' }}>Produk tidak ditemukan</h2>
          <p className="text-muted mb-3">Produk yang kamu cari tidak ada atau sudah dihapus.</p>
          <Link href="/products" className="btn btn-primary">← Kembali ke Produk</Link>
        </div>
      </main>
    );
  }

  const activeVariantId = selectedVariant || (product.variants?.find(v => v.isRecommended)?.id || product.variants?.[0]?.id);
  const activeVariant = product.variants?.find(v => v.id === activeVariantId);

  const renderStars = (rating: number) => {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  };

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

      <div className="container">
        {/* Breadcrumb */}
        <div className="detail-breadcrumb" style={{ paddingTop: '24px' }}>
          <Link href="/">Beranda</Link>{' / '}
          <Link href="/products">Produk</Link>{' / '}
          {product.category && (
            <><Link href={`/products?category=${product.category.slug}`}>{product.category.name}</Link>{' / '}</>
          )}
          <span style={{ color: 'var(--color-text)' }}>{product.name}</span>
        </div>

        <div className="detail-layout">
          {/* ─── LEFT: Product Info ─── */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h1 className="detail-title">{product.name}</h1>
              {/* Wishlist button */}
              <button
                className="btn btn-ghost"
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
                title={inWishlist ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
                style={{ fontSize: '22px', padding: '8px', minWidth: 'auto' }}
              >
                {inWishlist ? '❤️' : '🤍'}
              </button>
            </div>

            <div className="detail-meta">
              <span className="product-type-badge">
                {PRODUCT_TYPE_LABELS[product.type] || product.type}
              </span>
              {product.badges?.map((b, i) => (
                <span key={i} style={{ fontSize: '18px' }}>{b}</span>
              ))}
              <span className="detail-meta-item">
                📦 {product.totalSold?.toLocaleString() || 0} terjual
              </span>
              {product.slaText && (
                <span className="detail-meta-item">⏱️ {product.slaText}</span>
              )}
              {avgRating > 0 && (
                <span className="detail-meta-item" style={{ color: '#f59e0b' }}>
                  {renderStars(avgRating)} {avgRating.toFixed(1)}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="detail-section">
              <h3>Deskripsi</h3>
              <p className="detail-desc">{product.description}</p>
            </div>

            {/* Benefits */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="detail-section">
                <h3>Keunggulan</h3>
                <ul className="detail-benefits">
                  {product.benefits.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            )}

            {/* How it works */}
            {product.howItWorks && product.howItWorks.length > 0 && (
              <div className="detail-section">
                <h3>Cara Kerja</h3>
                <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {product.howItWorks.map((step, i) => (
                    <li key={i} style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Rules */}
            {product.rules && (
              <div className="detail-section">
                <h3>Ketentuan Penggunaan</h3>
                <p className="detail-desc">{product.rules}</p>
              </div>
            )}

            {/* Warranty */}
            {product.warrantyInfo && (
              <div className="detail-section">
                <h3>Garansi</h3>
                <div className="card" style={{ background: 'rgba(0, 184, 148, 0.06)', borderColor: 'rgba(0, 184, 148, 0.2)' }}>
                  <p style={{ fontSize: '14px', color: 'var(--color-secondary)' }}>
                    🛡️ {product.warrantyInfo}
                  </p>
                </div>
              </div>
            )}

            {/* FAQ */}
            {product.faq && product.faq.length > 0 && (
              <div className="detail-section">
                <h3>FAQ</h3>
                <div className="faq-list" style={{ maxWidth: '100%' }}>
                  {product.faq.map((item, i) => (
                    <details key={i} className="faq-item card">
                      <summary className="faq-question">{item.question}</summary>
                      <p className="faq-answer">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="detail-section">
              <h3>⭐ Ulasan ({reviews.length})</h3>
              {reviews.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Belum ada ulasan untuk produk ini.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="card" style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: '#f59e0b', fontSize: '14px' }}>{renderStars(review.rating)}</span>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          {new Date(review.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      {review.comment && (
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─── RIGHT: Sidebar ─── */}
          <div className="detail-sidebar">
            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Pilih Paket</h3>

              {product.variants?.length > 0 ? (
                <div className="variant-list">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className={`variant-card ${activeVariantId === variant.id ? 'active' : ''} ${variant.isRecommended ? 'recommended' : ''}`}
                      onClick={() => setSelectedVariant(variant.id)}
                    >
                      {variant.isRecommended && <span className="variant-recommended-badge">Rekomendasi</span>}
                      <span className="variant-name">{variant.name}</span>
                      <div className="variant-price">
                        <span className="price-current" style={{ fontSize: '15px' }}>{formatPrice(variant.price)}</span>
                        {variant.originalPrice && (
                          <span className="price-original">{formatPrice(variant.originalPrice)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '16px', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', marginBottom: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-secondary)' }}>{formatPrice(product.basePrice || 0)}</span>
                </div>
              )}

              {/* Dynamic fields */}
              {product.fields?.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  {product.fields.map((field) => (
                    <div className="form-group" key={field.fieldName}>
                      <label className="form-label" htmlFor={field.fieldName}>
                        {field.fieldLabel}
                        {field.isRequired && <span style={{ color: 'var(--color-danger)' }}> *</span>}
                      </label>
                      <input
                        id={field.fieldName}
                        type={field.fieldType}
                        className="form-input"
                        placeholder={field.placeholder}
                        value={fieldValues[field.fieldName] || ''}
                        onChange={(e) => setFieldValues({ ...fieldValues, [field.fieldName]: e.target.value })}
                        required={field.isRequired}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Price summary */}
              {activeVariant && (
                <div style={{ padding: '16px', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-muted text-sm">Paket</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{activeVariant.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted text-sm">Total</span>
                    <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-secondary)' }}>
                      {formatPrice(activeVariant.price)}
                    </span>
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary btn-lg btn-full"
                onClick={handleBuyNow}
                id="buy-now-btn"
              >
                Beli Sekarang →
              </button>

              <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '12px' }}>
                🔒 Transaksi aman & terenkripsi
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
