'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { api } from '@/lib/api';

interface OrderItem {
  id: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalPrice: number;
  finalPrice: number;
  guestEmail: string;
  guestPhone: string;
  createdAt: string;
  paidAt: string | null;
  items: OrderItem[];
}

interface Fulfillment {
  id: string;
  orderId: string;
  type: string;
  status: string;
  deliveryContent: Record<string, any> | null;
  notes: string | null;
  createdAt: string;
  completedAt: string | null;
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  pending: { label: 'Menunggu Bayar', className: 'badge-warning' },
  paid: { label: 'Sudah Bayar', className: 'badge-success' },
  processing: { label: 'Diproses', className: 'badge-primary' },
  completed: { label: 'Selesai', className: 'badge-success' },
  expired: { label: 'Kedaluwarsa', className: 'badge-neutral' },
  failed: { label: 'Gagal', className: 'badge-danger' },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [fulfillment, setFulfillment] = useState<Fulfillment | null>(null);
  const [deliveryContent, setDeliveryContent] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get<any>(`/admin/orders${params}`);
      const data = res?.data || res;
      setOrders(data?.orders || []);
    } catch {
      // In dev mode without backend, show empty
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const loadFulfillment = async (orderId: string) => {
    try {
      const res = await api.get<any>(`/admin/fulfillments/order/${orderId}`);
      setFulfillment(res?.data || res);
    } catch {
      setFulfillment(null);
    }
  };

  const selectOrder = async (order: Order) => {
    setSelectedOrder(order);
    setDeliveryContent('');
    setDeliveryNotes('');
    await loadFulfillment(order.id);
  };

  const handleInputContent = async () => {
    if (!fulfillment || !deliveryContent.trim()) return;
    setActionLoading(true);
    try {
      let content: Record<string, any>;
      try {
        content = JSON.parse(deliveryContent);
      } catch {
        content = { text: deliveryContent };
      }
      await api.post(`/admin/fulfillments/${fulfillment.id}/content`, {
        content,
        notes: deliveryNotes || undefined,
      });
      await loadFulfillment(fulfillment.orderId);
    } catch (err) {
      alert('Gagal menyimpan konten');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeliver = async () => {
    if (!fulfillment) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/fulfillments/${fulfillment.id}/deliver`, {});
      await loadFulfillment(fulfillment.orderId);
      await fetchOrders();
    } catch (err) {
      alert('Gagal mengirim delivery');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main>
      <header className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="nav-logo">TokDig</Link>
          <nav className="nav-links">
            <Link href="/admin/orders">Orders</Link>
            <Link href="/products">Produk</Link>
          </nav>
        </div>
      </header>

      <div className="container" style={{ padding: '24px 16px 64px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>📦 Kelola Pesanan</h1>
          <select
            className="catalog-sort"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            id="order-status-filter"
          >
            <option value="">Semua Status</option>
            <option value="pending">Menunggu Bayar</option>
            <option value="paid">Sudah Bayar</option>
            <option value="processing">Diproses</option>
            <option value="completed">Selesai</option>
            <option value="expired">Kedaluwarsa</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 420px' : '1fr', gap: '24px' }}>
          {/* Order list */}
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <div className="spinner spinner-dark" style={{ width: 32, height: 32, margin: '0 auto' }} />
              </div>
            ) : orders.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                <p style={{ fontSize: '32px', marginBottom: '8px' }}>📋</p>
                <p className="text-muted">Belum ada pesanan</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {orders.map((order) => {
                  const badge = STATUS_BADGES[order.status] || STATUS_BADGES.pending;
                  return (
                    <div
                      key={order.id}
                      className={`card card-hover`}
                      style={{
                        cursor: 'pointer',
                        borderColor: selectedOrder?.id === order.id ? 'var(--color-primary)' : undefined,
                      }}
                      onClick={() => selectOrder(order)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>
                          {order.orderNumber}
                        </span>
                        <span className={`badge ${badge.className}`}>{badge.label}</span>
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
                            {order.guestEmail || '—'} • {new Date(order.createdAt).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-secondary)' }}>
                          {formatPrice(order.finalPrice)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order detail sidebar */}
          {selectedOrder && (
            <div style={{ position: 'sticky', top: '88px', alignSelf: 'start' }}>
              <div className="card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Detail Pesanan</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelectedOrder(null)}>✕</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div className="flex justify-between">
                    <span className="text-muted">No. Pesanan</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{selectedOrder.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Status</span>
                    <span className={`badge ${(STATUS_BADGES[selectedOrder.status] || STATUS_BADGES.pending).className}`}>
                      {(STATUS_BADGES[selectedOrder.status] || STATUS_BADGES.pending).label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Total</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>
                      {formatPrice(selectedOrder.finalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Email</span>
                    <span>{selectedOrder.guestEmail || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Tanggal</span>
                    <span>{new Date(selectedOrder.createdAt).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Items */}
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Items</div>
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
                      <span>{item.productName} {item.variantName && `(${item.variantName})`}</span>
                      <span>{formatPrice(item.price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fulfillment actions */}
              {(selectedOrder.status === 'paid' || selectedOrder.status === 'processing') && (
                <div className="card">
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
                    🚀 Fulfillment
                  </h3>

                  {fulfillment?.status === 'completed' ? (
                    <div className="alert alert-success">
                      ✅ Delivery telah dikirim
                    </div>
                  ) : (
                    <>
                      <div className="form-group">
                        <label className="form-label">Konten Delivery</label>
                        <textarea
                          className="form-input"
                          rows={4}
                          placeholder='{"email": "...", "password": "..."} atau teks biasa'
                          value={deliveryContent}
                          onChange={(e) => setDeliveryContent(e.target.value)}
                          style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                          id="delivery-content"
                        />
                        <span className="form-hint">JSON atau teks biasa</span>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Catatan (opsional)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Catatan internal"
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          id="delivery-notes"
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={handleInputContent}
                          disabled={actionLoading || !deliveryContent.trim()}
                          style={{ flex: 1 }}
                        >
                          💾 Simpan
                        </button>
                        <button
                          className="btn btn-success"
                          onClick={handleDeliver}
                          disabled={actionLoading || !fulfillment?.deliveryContent}
                          style={{ flex: 1 }}
                        >
                          {actionLoading ? '...' : '📤 Kirim'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
