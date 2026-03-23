'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { api } from '@/lib/api';

interface PaymentStatus {
  payment: {
    status: string;
    method: string;
    amount: number;
    paymentUrl: string;
    paidAt: string | null;
    expiredAt: string | null;
  };
  order: {
    id: string;
    orderNumber: string;
    status: string;
    totalPrice: number;
    finalPrice: number;
    items: Array<{
      productName: string;
      variantName: string;
      price: number;
      quantity: number;
    }>;
  };
}

const STATUS_CONFIG: Record<string, { icon: string; color: string; label: string; description: string }> = {
  pending: {
    icon: '⏳',
    color: 'var(--color-accent)',
    label: 'Menunggu Pembayaran',
    description: 'Silakan selesaikan pembayaran Anda sebelum batas waktu habis.',
  },
  paid: {
    icon: '✅',
    color: 'var(--color-secondary)',
    label: 'Pembayaran Berhasil',
    description: 'Pembayaran telah dikonfirmasi. Produk akan segera dikirim ke Anda.',
  },
  completed: {
    icon: '🎉',
    color: 'var(--color-secondary)',
    label: 'Pesanan Selesai',
    description: 'Produk telah dikirim. Cek dashboard atau email Anda untuk detail akses.',
  },
  expired: {
    icon: '⏰',
    color: 'var(--color-text-muted)',
    label: 'Pembayaran Kedaluwarsa',
    description: 'Waktu pembayaran telah habis. Silakan buat pesanan baru.',
  },
  failed: {
    icon: '❌',
    color: 'var(--color-danger)',
    label: 'Pembayaran Gagal',
    description: 'Pembayaran tidak berhasil. Silakan coba lagi atau hubungi CS.',
  },
};

function OrderStatusContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order_id') || '';
  const isSimulate = searchParams.get('simulate') === 'true';

  const [data, setData] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState('');
  const [simulating, setSimulating] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!orderNumber) return;
    try {
      const response = await api.get<{ data: PaymentStatus }>(
        `/payments/status/${orderNumber}`,
      );
      setData(response.data);
      setError('');
    } catch {
      setError('Tidak dapat memuat status pesanan');
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Auto-refresh every 10s while pending
  useEffect(() => {
    if (data?.payment?.status !== 'pending') return;

    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [data?.payment?.status, fetchStatus]);

  // Countdown timer
  useEffect(() => {
    if (data?.payment?.status !== 'pending') return;

    const updateCountdown = () => {
      // 24 hours from now (simplified)
      const expiry = data?.payment?.expiredAt
        ? new Date(data.payment.expiredAt)
        : new Date(Date.now() + 24 * 60 * 60 * 1000);

      const diff = expiry.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown('00:00:00');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [data?.payment?.status, data?.payment?.expiredAt]);

  // Simulate payment (dev only)
  const handleSimulate = async () => {
    setSimulating(true);
    try {
      await api.post(`/payments/simulate/${orderNumber}`, {});
      await fetchStatus();
    } catch {
      setError('Simulasi gagal');
    } finally {
      setSimulating(false);
    }
  };

  const status = data?.order?.status || data?.payment?.status || 'pending';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

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

      <div className="container" style={{ maxWidth: '640px', padding: '40px 16px 80px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div className="spinner spinner-dark" style={{ width: 40, height: 40, margin: '0 auto 16px' }} />
            <p className="text-muted">Memuat status pesanan...</p>
          </div>
        ) : error && !data ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>😵</p>
            <h2 style={{ marginBottom: '8px' }}>Oops!</h2>
            <p className="text-muted mb-3">{error}</p>
            <Link href="/products" className="btn btn-primary">Kembali ke Produk</Link>
          </div>
        ) : data && (
          <div style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>
            {/* Status indicator */}
            <div className="card" style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>{config.icon}</div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: config.color, marginBottom: '8px' }}>
                {config.label}
              </h1>
              <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                {config.description}
              </p>

              {/* Countdown for pending */}
              {status === 'pending' && countdown && (
                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  background: 'var(--color-bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                    Sisa waktu pembayaran
                  </div>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-accent)',
                    letterSpacing: '2px',
                  }}>
                    {countdown}
                  </div>
                </div>
              )}

              {/* Payment button for pending */}
              {status === 'pending' && data.payment?.paymentUrl && (
                <div style={{ marginTop: '20px' }}>
                  <a
                    href={data.payment.paymentUrl}
                    className="btn btn-primary btn-lg btn-full"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Lanjutkan Pembayaran →
                  </a>
                </div>
              )}

              {/* Simulate button (dev only) */}
              {isSimulate && status === 'pending' && (
                <div style={{ marginTop: '12px' }}>
                  <button
                    className="btn btn-success btn-full"
                    onClick={handleSimulate}
                    disabled={simulating}
                  >
                    {simulating ? 'Simulating...' : '🧪 Simulasi Bayar (Dev Only)'}
                  </button>
                </div>
              )}
            </div>

            {/* Order details */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
                Detail Pesanan
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                <div className="flex justify-between">
                  <span className="text-muted">No. Pesanan</span>
                  <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {data.order.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Status</span>
                  <span style={{ fontWeight: 600, color: config.color }}>
                    {config.label}
                  </span>
                </div>
                {data.payment?.method && (
                  <div className="flex justify-between">
                    <span className="text-muted">Metode Bayar</span>
                    <span style={{ textTransform: 'uppercase' }}>{data.payment.method}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
                Item Pesanan
              </h3>

              {data.order.items?.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: i < data.order.items.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.productName}</div>
                    {item.variantName && (
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        {item.variantName} × {item.quantity}
                      </div>
                    )}
                  </div>
                  <span style={{ fontWeight: 600 }}>{formatPrice(item.price)}</span>
                </div>
              ))}

              <div style={{
                borderTop: '1px solid var(--color-border)',
                paddingTop: '12px',
                marginTop: '12px',
              }}>
                <div className="flex justify-between items-center">
                  <span style={{ fontWeight: 600 }}>Total</span>
                  <span style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: 'var(--color-secondary)',
                  }}>
                    {formatPrice(data.order.finalPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/products" className="btn btn-secondary" style={{ flex: 1 }}>
                ← Lanjut Belanja
              </Link>
              <Link href="/" className="btn btn-ghost" style={{ flex: 1 }}>
                Beranda
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function OrderStatusPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner spinner-dark" style={{ width: 40, height: 40 }} />
      </div>
    }>
      <OrderStatusContent />
    </Suspense>
  );
}
