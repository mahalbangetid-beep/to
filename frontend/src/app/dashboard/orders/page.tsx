'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { api } from '@/lib/api';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  finalPrice: number;
  createdAt: string;
  items: Array<{ productName: string; variantName: string; price: number }>;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Menunggu', cls: 'badge-warning' },
  paid: { label: 'Dibayar', cls: 'badge-success' },
  completed: { label: 'Selesai', cls: 'badge-success' },
  expired: { label: 'Expired', cls: 'badge-neutral' },
  failed: { label: 'Gagal', cls: 'badge-danger' },
};

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get<any>(`/orders/my${params}`);
      const data = res?.data || res;
      setOrders(data?.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700 }}>📦 Riwayat Pesanan</h1>
        <select
          className="catalog-sort"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Semua</option>
          <option value="pending">Menunggu</option>
          <option value="paid">Dibayar</option>
          <option value="completed">Selesai</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <div className="spinner spinner-dark" style={{ width: 32, height: 32, margin: '0 auto' }} />
        </div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ fontSize: '32px', marginBottom: '8px' }}>📋</p>
          <p style={{ fontWeight: 600, marginBottom: '4px' }}>Belum ada pesanan</p>
          <p className="text-muted text-sm mb-3">Belanja sekarang dan nikmati produk digital terbaik</p>
          <Link href="/products" className="btn btn-primary">Belanja Sekarang</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {orders.map((order) => {
            const st = STATUS_MAP[order.status] || STATUS_MAP.pending;
            return (
              <Link
                key={order.id}
                href={`/dashboard/orders/detail?id=${order.orderNumber}`}
                className="card card-hover"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>
                    {order.orderNumber}
                  </span>
                  <span className={`badge ${st.cls}`}>{st.label}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    {order.items?.map((item, i) => (
                      <div key={i} style={{ fontSize: '14px' }}>
                        {item.productName}
                        {item.variantName && <span className="text-muted"> — {item.variantName}</span>}
                      </div>
                    ))}
                    <div className="text-muted text-sm" style={{ marginTop: '4px' }}>
                      {new Date(order.createdAt).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-secondary)' }}>
                    {formatPrice(order.finalPrice)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
