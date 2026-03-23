'use client';

import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/utils';
import { api } from '@/lib/api';

interface AdminStats {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
    totalProducts: number;
    pendingFulfillments: number;
    pendingClaims: number;
  };
  ordersByStatus: Record<string, number>;
  revenueByDay: Array<{ date: string; revenue: string; orders: string }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    finalPrice: number;
    createdAt: string;
    items: Array<{ productName: string; variantName: string }>;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'var(--color-accent)',
  paid: 'var(--color-secondary)',
  completed: 'var(--color-secondary)',
  expired: 'var(--color-text-muted)',
  failed: 'var(--color-danger)',
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<any>('/admin/stats');
        setData(res?.data || res);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px' }}>
        <div className="spinner spinner-dark" style={{ width: 40, height: 40, margin: '0 auto' }} />
      </div>
    );
  }

  const stats = data?.stats || { totalOrders: 0, totalRevenue: 0, totalUsers: 0, totalProducts: 0, pendingFulfillments: 0, pendingClaims: 0 };

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>📊 Admin Dashboard</h1>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: 'var(--color-primary)' },
          { label: 'Revenue', value: formatPrice(stats.totalRevenue), icon: '💰', color: 'var(--color-secondary)' },
          { label: 'Users', value: stats.totalUsers, icon: '👥', color: 'var(--color-accent)' },
          { label: 'Products', value: stats.totalProducts, icon: '🏷️', color: 'var(--color-primary)' },
          { label: 'Fulfillment Pending', value: stats.pendingFulfillments, icon: '🚀', color: stats.pendingFulfillments > 0 ? 'var(--color-accent)' : 'var(--color-secondary)' },
          { label: 'Claims Pending', value: stats.pendingClaims, icon: '🛡️', color: stats.pendingClaims > 0 ? 'var(--color-accent)' : 'var(--color-secondary)' },
        ].map((stat) => (
          <div key={stat.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-muted text-sm" style={{ marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Orders by status */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
            Orders by Status
          </h3>
          {data?.ordersByStatus && Object.keys(data.ordersByStatus).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(data.ordersByStatus).map(([status, count]) => {
                const total = Object.values(data.ordersByStatus).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={status}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span style={{ textTransform: 'capitalize' }}>{status}</span>
                      <span className="text-muted">{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: STATUS_COLORS[status] || 'var(--color-primary)',
                        borderRadius: '3px',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted text-sm">Belum ada data</p>
          )}
        </div>

        {/* Revenue chart (simple bars) */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
            Revenue (7 Hari Terakhir)
          </h3>
          {data?.revenueByDay && data.revenueByDay.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '120px' }}>
              {data.revenueByDay.map((day) => {
                const maxRev = Math.max(...data.revenueByDay.map((d) => Number(d.revenue)));
                const height = maxRev > 0 ? Math.max(8, (Number(day.revenue) / maxRev) * 100) : 8;
                return (
                  <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{
                      width: '100%',
                      height: `${height}%`,
                      background: 'linear-gradient(180deg, var(--color-primary), var(--color-secondary))',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'height 0.5s ease',
                    }}
                      title={`${day.date}: ${formatPrice(Number(day.revenue))}`}
                    />
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                      {day.date.slice(-2)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted text-sm">Belum ada data revenue</p>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
          Pesanan Terbaru
        </h3>
        {data?.recentOrders && data.recentOrders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.recentOrders.map((order) => (
              <div key={order.id} className="card" style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', marginRight: '12px' }}>
                      {order.orderNumber}
                    </span>
                    <span style={{ fontSize: '13px' }}>
                      {order.items?.[0]?.productName || '—'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      {formatPrice(order.finalPrice)}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: `${STATUS_COLORS[order.status] || 'var(--color-text-muted)'}20`,
                      color: STATUS_COLORS[order.status] || 'var(--color-text-muted)',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
            <p className="text-muted text-sm">Belum ada pesanan</p>
          </div>
        )}
      </div>
    </div>
  );
}
