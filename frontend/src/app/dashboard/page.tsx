'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface DashboardData {
  stats: { totalOrders: number; activeProducts: number };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    finalPrice: number;
    createdAt: string;
    items: Array<{ productName: string }>;
  }>;
  activeSubscriptions: Array<{
    id: string;
    productId: string;
    status: string;
    startDate: string;
    endDate: string;
  }>;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Menunggu', cls: 'badge-warning' },
  paid: { label: 'Dibayar', cls: 'badge-success' },
  completed: { label: 'Selesai', cls: 'badge-success' },
  expired: { label: 'Expired', cls: 'badge-neutral' },
  failed: { label: 'Gagal', cls: 'badge-danger' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<any>('/dashboard/overview');
        setData(res?.data || res);
      } catch {
        // fallback empty
        setData({
          stats: { totalOrders: 0, activeProducts: 0 },
          recentOrders: [],
          activeSubscriptions: [],
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <div className="spinner spinner-dark" style={{ width: 32, height: 32, margin: '0 auto' }} />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>
        Halo, {user?.fullName || 'User'} 👋
      </h1>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.08), rgba(108, 92, 231, 0.02))',
        }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-primary)' }}>
            {data?.stats.totalOrders || 0}
          </div>
          <div className="text-muted text-sm" style={{ marginTop: '4px' }}>Total Pesanan</div>
        </div>
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(0, 184, 148, 0.08), rgba(0, 184, 148, 0.02))',
        }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-secondary)' }}>
            {data?.stats.activeProducts || 0}
          </div>
          <div className="text-muted text-sm" style={{ marginTop: '4px' }}>Produk Aktif</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <Link href="/products" className="btn btn-primary btn-sm">🛒 Beli Produk</Link>
        <Link href="/dashboard/orders" className="btn btn-secondary btn-sm">📦 Riwayat Pesanan</Link>
        <Link href="/dashboard/products" className="btn btn-secondary btn-sm">🎁 Produk Saya</Link>
        <Link href="/dashboard/wishlist" className="btn btn-ghost btn-sm">❤️ Wishlist</Link>
        <Link href="/dashboard/claims" className="btn btn-ghost btn-sm">🛡️ Klaim</Link>
      </div>

      {/* Recent Orders */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Pesanan Terbaru</h2>
          <Link href="/dashboard/orders" className="section-link">Lihat semua →</Link>
        </div>

        {(!data?.recentOrders || data.recentOrders.length === 0) ? (
          <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
            <p style={{ fontSize: '24px', marginBottom: '8px' }}>📦</p>
            <p className="text-muted text-sm">Belum ada pesanan</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.recentOrders.map((order) => {
              const st = STATUS_MAP[order.status] || STATUS_MAP.pending;
              return (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/detail?id=${order.orderNumber}`}
                  className="card card-hover"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>
                        {order.items?.[0]?.productName || order.orderNumber}
                      </div>
                      <div className="text-muted text-sm">
                        {order.orderNumber} • {new Date(order.createdAt).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>
                        {formatPrice(order.finalPrice)}
                      </span>
                      <span className={`badge ${st.cls}`}>{st.label}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Active subscriptions */}
      {data?.activeSubscriptions && data.activeSubscriptions.length > 0 && (
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            Produk Aktif
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
            {data.activeSubscriptions.map((sub) => {
              const daysLeft = sub.endDate
                ? Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                : null;
              return (
                <div key={sub.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="badge badge-success">Aktif</span>
                    {daysLeft !== null && (
                      <span className="text-muted text-sm">{daysLeft} hari tersisa</span>
                    )}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>
                    Product #{sub.productId.slice(0, 8)}
                  </div>
                  <div className="text-muted text-sm" style={{ marginTop: '4px' }}>
                    {new Date(sub.startDate).toLocaleDateString('id-ID')} — {new Date(sub.endDate).toLocaleDateString('id-ID')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
