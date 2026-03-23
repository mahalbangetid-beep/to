'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { api, ApiError } from '@/lib/api';

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  durationDays?: number;
}

interface ProductField {
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  isRequired: boolean;
  placeholder?: string;
  options?: string[];
}

interface ProductData {
  id: string;
  name: string;
  slug: string;
  type: string;
  shortDesc: string;
  basePrice: number;
  variants: ProductVariant[];
  fields: ProductField[];
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productSlug = searchParams.get('product') || '';
  const variantParam = searchParams.get('variant') || '';

  const [product, setProduct] = useState<ProductData | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  // Fetch product data
  useEffect(() => {
    if (!productSlug) { setPageLoading(false); return; }
    (async () => {
      try {
        const res = await api.get<{ data: ProductData }>(`/products/${productSlug}`);
        const p = (res as any).data || (res as any);
        setProduct(p);

        // Select variant
        if (p.variants?.length) {
          const found = variantParam
            ? p.variants.find((v: ProductVariant) => v.id === variantParam || v.name === variantParam)
            : p.variants[0];
          setSelectedVariant(found || p.variants[0]);
        }
      } catch {
        setError('Produk tidak ditemukan');
      }
      setPageLoading(false);
    })();
  }, [productSlug, variantParam]);

  const currentPrice = selectedVariant?.price ?? product?.basePrice ?? 0;
  const originalPrice = selectedVariant?.originalPrice;
  const finalPrice = Math.max(0, currentPrice - promoDiscount);

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setPromoLoading(true);
    setPromoMessage('');
    setPromoDiscount(0);
    try {
      const res = await api.post<{ data: { valid: boolean; discountAmount: number; message: string } }>('/promo/validate', {
        code: promoCode,
        cartTotal: currentPrice,
      });
      const result = (res as any).data || res;
      setPromoDiscount(result.discountAmount || 0);
      setPromoMessage(result.message || 'Promo diterapkan!');
    } catch (err: any) {
      setPromoMessage(err?.message || 'Kode promo tidak valid');
      setPromoDiscount(0);
    }
    setPromoLoading(false);
  };

  const handleCheckout = async () => {
    if (!product) return;
    setError('');
    setLoading(true);

    try {
      const response = await api.post<{ data: any }>('/orders', {
        items: [
          {
            productId: product.id,
            variantId: selectedVariant?.id || undefined,
            quantity: 1,
            fieldValues,
          },
        ],
        guestEmail: guestEmail || undefined,
        guestPhone: guestPhone || undefined,
        promoCode: promoCode || undefined,
      });

      const orderData = (response as any).data || response;
      const payment = orderData?.payment;

      if (payment?.paymentUrl) {
        window.location.href = payment.paymentUrl;
      } else {
        router.push(`/dashboard/orders/detail?id=${orderData?.orderNumber || orderData?.id}`);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <main>
        <header className="navbar"><div className="container navbar-inner"><Link href="/" className="nav-logo">TokDig</Link></div></header>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="spinner spinner-dark" style={{ width: 40, height: 40 }} />
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main>
        <header className="navbar"><div className="container navbar-inner"><Link href="/" className="nav-logo">TokDig</Link></div></header>
        <div className="container" style={{ textAlign: 'center', padding: '80px 16px' }}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</p>
          <p style={{ fontWeight: 600 }}>Produk tidak ditemukan</p>
          <Link href="/products" className="btn btn-primary" style={{ marginTop: '16px' }}>Kembali ke Produk</Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <header className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="nav-logo">TokDig</Link>
          <nav className="nav-links">
            <Link href="/products">Produk</Link>
          </nav>
        </div>
      </header>

      <div className="container">
        <div className="detail-breadcrumb" style={{ paddingTop: '24px' }}>
          <Link href="/">Beranda</Link> / <Link href="/products">Produk</Link> / <Link href={`/products/${product.slug}`}>{product.name}</Link> / <span>Checkout</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px', padding: '24px 0 64px' }}>
          {/* LEFT: Checkout Form */}
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Checkout</h1>

            {error && <div className="alert alert-error" role="alert">{error}</div>}

            {/* Variant selector (if multiple) */}
            {product.variants.length > 1 && (
              <div className="card" style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>📦 Pilih Paket</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {product.variants.map((v) => (
                    <label
                      key={v.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 16px', borderRadius: 'var(--radius-md)',
                        border: `2px solid ${selectedVariant?.id === v.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        background: selectedVariant?.id === v.id ? 'rgba(108, 92, 231, 0.04)' : 'transparent',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      <input
                        type="radio"
                        name="variant"
                        checked={selectedVariant?.id === v.id}
                        onChange={() => setSelectedVariant(v)}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{v.name}</div>
                        {v.durationDays && <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{v.durationDays} hari</div>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: 'var(--color-secondary)' }}>{formatPrice(v.price)}</div>
                        {v.originalPrice && <div className="price-original">{formatPrice(v.originalPrice)}</div>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Contact info */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>📧 Informasi Kontak</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                Kami akan mengirim detail pesanan ke email ini
              </p>
              <div className="form-group">
                <label className="form-label" htmlFor="checkout-email">Email *</label>
                <input id="checkout-email" type="email" className="form-input" placeholder="email@contoh.com"
                  value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="checkout-phone">
                  No. HP <span className="text-muted">(opsional)</span>
                </label>
                <input id="checkout-phone" type="tel" className="form-input" placeholder="08xxxxxxxxxx"
                  value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
              </div>
            </div>

            {/* Dynamic product fields */}
            {product.fields?.length > 0 && (
              <div className="card" style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>📝 Detail Produk</h3>
                {product.fields.map((field) => (
                  <div className="form-group" key={field.fieldName}>
                    <label className="form-label" htmlFor={`field-${field.fieldName}`}>
                      {field.fieldLabel}
                      {field.isRequired && <span style={{ color: 'var(--color-danger)' }}> *</span>}
                    </label>
                    {field.fieldType === 'select' && field.options?.length ? (
                      <select
                        id={`field-${field.fieldName}`}
                        className="form-input"
                        value={fieldValues[field.fieldName] || ''}
                        onChange={(e) => setFieldValues({ ...fieldValues, [field.fieldName]: e.target.value })}
                        required={field.isRequired}
                      >
                        <option value="">Pilih...</option>
                        {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input
                        id={`field-${field.fieldName}`}
                        type={field.fieldType || 'text'}
                        className="form-input"
                        placeholder={field.placeholder}
                        value={fieldValues[field.fieldName] || ''}
                        onChange={(e) => setFieldValues({ ...fieldValues, [field.fieldName]: e.target.value })}
                        required={field.isRequired}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Promo code */}
            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>🎫 Kode Promo</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" className="form-input" placeholder="Masukkan kode promo"
                  value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  id="promo-code" style={{ flex: 1 }} />
                <button className="btn btn-secondary" disabled={!promoCode || promoLoading} onClick={handleApplyPromo}>
                  {promoLoading ? '⏳' : 'Terapkan'}
                </button>
              </div>
              {promoMessage && (
                <p style={{ marginTop: '8px', fontSize: '13px', color: promoDiscount > 0 ? '#22c55e' : '#ef4444' }}>
                  {promoDiscount > 0 ? '✅' : '❌'} {promoMessage}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div>
            <div className="card" style={{ position: 'sticky', top: '88px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Ringkasan Pesanan</h3>

              <div style={{ padding: '16px', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{product.name}</div>
                {selectedVariant && (
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Paket: {selectedVariant.name}</div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Harga</span>
                  <span style={{ fontSize: '14px' }}>
                    {originalPrice && (
                      <span className="price-original" style={{ marginRight: '8px' }}>{formatPrice(originalPrice)}</span>
                    )}
                    {formatPrice(currentPrice)}
                  </span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted text-sm">🎫 Diskon Promo</span>
                    <span style={{ fontSize: '14px', color: '#22c55e' }}>-{formatPrice(promoDiscount)}</span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', marginBottom: '20px' }}>
                <div className="flex justify-between items-center">
                  <span style={{ fontWeight: 600 }}>Total</span>
                  <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-secondary)' }}>
                    {formatPrice(finalPrice)}
                  </span>
                </div>
              </div>

              <button className="btn btn-primary btn-lg btn-full" onClick={handleCheckout}
                disabled={loading || !guestEmail} id="checkout-btn">
                {loading ? (<><span className="spinner" /> Memproses...</>) : 'Bayar Sekarang →'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                🔒 Pembayaran aman via Midtrans
              </div>

              <div style={{ marginTop: '20px', padding: '14px', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>Metode Pembayaran:</div>
                QRIS • GoPay • OVO • Dana • ShopeePay • Transfer Bank (BCA, BNI, BRI, Mandiri) • Indomaret • Alfamart
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner spinner-dark" style={{ width: 40, height: 40 }} />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
