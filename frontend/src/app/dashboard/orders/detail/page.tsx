'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  customerName: string;
  customerEmail: string;
  paidAt: string | null;
  completedAt: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    variantName: string;
    price: number;
    quantity: number;
  }>;
}

const STATUS_MAP: Record<string, { label: string; cls: string; desc: string }> = {
  pending: { label: 'Menunggu Pembayaran', cls: 'badge-warning', desc: 'Silakan selesaikan pembayaran Anda.' },
  paid: { label: 'Dibayar', cls: 'badge-success', desc: 'Pembayaran berhasil! Pesanan sedang diproses.' },
  processing: { label: 'Diproses', cls: 'badge-primary', desc: 'Pesanan sedang disiapkan oleh tim kami.' },
  completed: { label: 'Selesai', cls: 'badge-success', desc: 'Pesanan selesai. Terima kasih!' },
  expired: { label: 'Expired', cls: 'badge-neutral', desc: 'Waktu pembayaran habis.' },
  failed: { label: 'Gagal', cls: 'badge-danger', desc: 'Pembayaran gagal.' },
  cancelled: { label: 'Dibatalkan', cls: 'badge-neutral', desc: 'Pesanan dibatalkan.' },
};

function OrderActions({ order }: { order: OrderDetail }) {
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  const [claimType, setClaimType] = useState('replacement');
  const [claimDesc, setClaimDesc] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimMsg, setClaimMsg] = useState('');

  const handleReview = async () => {
    if (!order.items?.[0]) return;
    setReviewLoading(true);
    setReviewMsg('');
    try {
      await api.post('/reviews', {
        productId: order.items[0].productId || order.items[0].id,
        orderId: order.id,
        rating: reviewRating,
        comment: reviewComment || undefined,
      });
      setReviewMsg('✅ Ulasan berhasil dikirim!');
    } catch (err: any) {
      setReviewMsg(`❌ ${err?.message || 'Gagal mengirim ulasan'}`);
    }
    setReviewLoading(false);
  };

  const handleClaim = async () => {
    if (!claimDesc.trim()) return;
    setClaimLoading(true);
    setClaimMsg('');
    try {
      await api.post('/claims', {
        orderId: order.id,
        orderItemId: order.items?.[0]?.id,
        type: claimType,
        description: claimDesc,
      });
      setClaimMsg('✅ Klaim berhasil diajukan! Tim kami akan meninjau.');
      setClaimDesc('');
    } catch (err: any) {
      setClaimMsg(`❌ ${err?.message || 'Gagal mengajukan klaim'}`);
    }
    setClaimLoading(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      {/* Review */}
      {order.status === 'completed' && (
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>⭐ Beri Ulasan</h3>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setReviewRating(star)}
                style={{
                  fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer',
                  color: star <= reviewRating ? '#f59e0b' : '#d1d5db',
                }}
              >
                ★
              </button>
            ))}
          </div>
          <div className="form-group">
            <textarea
              className="form-input"
              rows={3}
              placeholder="Bagikan pengalaman Anda... (opsional)"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
          </div>
          {reviewMsg && <p style={{ fontSize: '13px', marginBottom: '8px' }}>{reviewMsg}</p>}
          <button className="btn btn-primary btn-sm" onClick={handleReview} disabled={reviewLoading}>
            {reviewLoading ? '⏳...' : '📤 Kirim Ulasan'}
          </button>
        </div>
      )}

      {/* Claim */}
      {(order.status === 'paid' || order.status === 'completed' || order.status === 'processing') && (
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>🛡️ Ajukan Klaim</h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
            Produk bermasalah? Ajukan klaim garansi di sini.
          </p>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '12px' }}>Tipe Klaim</label>
            <select className="form-input" value={claimType} onChange={(e) => setClaimType(e.target.value)}>
              <option value="replacement">Replacement (Ganti)</option>
              <option value="error">Error (Produk Bermasalah)</option>
              <option value="not_received">Tidak Diterima</option>
            </select>
          </div>
          <div className="form-group">
            <textarea
              className="form-input"
              rows={3}
              placeholder="Jelaskan masalah yang Anda alami..."
              value={claimDesc}
              onChange={(e) => setClaimDesc(e.target.value)}
            />
          </div>
          {claimMsg && <p style={{ fontSize: '13px', marginBottom: '8px' }}>{claimMsg}</p>}
          <button className="btn btn-secondary btn-sm" onClick={handleClaim} disabled={claimLoading || !claimDesc.trim()}>
            {claimLoading ? '⏳...' : '📋 Ajukan Klaim'}
          </button>
        </div>
      )}
    </div>
  );
}

function OrderDetailContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || searchParams.get('order_id') || '';
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setError('ID pesanan tidak ditemukan');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await api.get<{ data: OrderDetail }>(`/orders/my/${orderId}`);
        setOrder(res.data as any || res as any);
      } catch (err: any) {
        setError(err?.message || 'Gagal memuat pesanan');
      }
      setLoading(false);
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '48px' }}><div className="spinner spinner-dark" style={{ width: 32, height: 32, margin: '0 auto' }} /></div>;
  }

  if (error || !order) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
        <p style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</p>
        <p>{error || 'Pesanan tidak ditemukan'}</p>
        <Link href="/dashboard/orders" className="btn btn-primary" style={{ marginTop: '16px' }}>Kembali</Link>
      </div>
    );
  }

  const st = STATUS_MAP[order.status] || STATUS_MAP.pending;

  return (
    <div>
      <div className="flex items-center" style={{ gap: '12px', marginBottom: '24px' }}>
        <Link href="/dashboard/orders" className="btn btn-ghost btn-sm">← Kembali</Link>
        <h1 style={{ fontSize: '20px', fontWeight: 700, flex: 1 }}>Detail Pesanan</h1>
        {(order.status === 'paid' || order.status === 'completed') && (
          <Link href={`/dashboard/orders/invoice?id=${orderId}`} className="btn btn-secondary btn-sm">🧾 Invoice</Link>
        )}
      </div>

      {/* Status banner */}
      <div className="card" style={{ marginBottom: '20px', borderLeft: '4px solid var(--color-primary)', padding: '20px 24px' }}>
        <div className="flex justify-between items-center">
          <div>
            <span className={`badge ${st.cls}`} style={{ fontSize: '13px', marginBottom: '8px' }}>{st.label}</span>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '4px' }}>{st.desc}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <code style={{ fontSize: '14px', fontWeight: 600 }}>{order.orderNumber}</code>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              {new Date(order.createdAt).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>🛒 Item Pesanan</h3>
        {order.items?.map((item, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--color-border)' : 'none',
          }}>
            <div>
              <div style={{ fontWeight: 600 }}>{item.productName}</div>
              {item.variantName && <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Paket: {item.variantName}</div>}
            </div>
            <span style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>{formatPrice(item.price)}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>💰 Ringkasan Harga</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(order.totalPrice)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between" style={{ color: '#22c55e' }}>
              <span>🎫 Diskon Promo</span>
              <span>-{formatPrice(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px', fontWeight: 700, fontSize: '16px' }}>
            <span>Total</span>
            <span style={{ color: 'var(--color-secondary)' }}>{formatPrice(order.finalPrice)}</span>
          </div>
        </div>
      </div>

      {/* Customer info */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>👤 Info Pemesan</h3>
        <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div><span style={{ color: 'var(--color-text-muted)', marginRight: '8px' }}>Nama:</span>{order.customerName}</div>
          <div><span style={{ color: 'var(--color-text-muted)', marginRight: '8px' }}>Email:</span>{order.customerEmail}</div>
          {order.paidAt && <div><span style={{ color: 'var(--color-text-muted)', marginRight: '8px' }}>Dibayar:</span>{new Date(order.paidAt).toLocaleString('id-ID')}</div>}
          {order.completedAt && <div><span style={{ color: 'var(--color-text-muted)', marginRight: '8px' }}>Selesai:</span>{new Date(order.completedAt).toLocaleString('id-ID')}</div>}
        </div>
      </div>

      {/* Actions */}
      <OrderActions order={order} />
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <div className="spinner spinner-dark" style={{ width: 32, height: 32, margin: '0 auto' }} />
      </div>
    }>
      <OrderDetailContent />
    </Suspense>
  );
}
