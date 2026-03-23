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
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    variantName: string;
    price: number;
    quantity: number;
  }>;
}

function InvoiceContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || '';
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    (async () => {
      try {
        const res = await api.get<{ data: OrderDetail }>(`/orders/my/${orderId}`);
        setOrder((res as any).data || res as any);
      } catch { /* skip */ }
      setLoading(false);
    })();
  }, [orderId]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '48px' }}><div className="spinner spinner-dark" style={{ width: 32, height: 32, margin: '0 auto' }} /></div>;
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <p>Pesanan tidak ditemukan.</p>
        <Link href="/dashboard/orders" className="btn btn-primary" style={{ marginTop: '16px' }}>Kembali</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
        <Link href={`/dashboard/orders/detail?id=${orderId}`} className="btn btn-ghost btn-sm">← Kembali</Link>
        <button className="btn btn-primary btn-sm" onClick={() => window.print()}>🖨️ Cetak</button>
      </div>

      <div className="card" id="invoice" style={{ maxWidth: '700px', margin: '0 auto', padding: '40px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', borderBottom: '2px solid var(--color-primary)', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '4px' }}>TokDig</h1>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Platform Digital Premium</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>INVOICE</h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600 }}>{order.orderNumber}</p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Customer Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Ditagihkan Kepada</h4>
            <p style={{ fontWeight: 600 }}>{order.customerName || '—'}</p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{order.customerEmail || '—'}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Status</h4>
            <span style={{
              padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600,
              background: order.status === 'paid' || order.status === 'completed' ? 'rgba(0,184,148,0.1)' : 'rgba(253,203,110,0.2)',
              color: order.status === 'paid' || order.status === 'completed' ? 'var(--color-secondary)' : 'var(--color-accent)',
            }}>
              {order.status === 'paid' ? 'LUNAS' : order.status === 'completed' ? 'SELESAI' : order.status.toUpperCase()}
            </span>
            {order.paidAt && (
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Dibayar: {new Date(order.paidAt).toLocaleDateString('id-ID')}
              </p>
            )}
          </div>
        </div>

        {/* Items table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ textAlign: 'left', padding: '10px 0', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Produk</th>
              <th style={{ textAlign: 'center', padding: '10px 0', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Qty</th>
              <th style={{ textAlign: 'right', padding: '10px 0', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Harga</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '12px 0' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.productName}</div>
                  {item.variantName && <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{item.variantName}</div>}
                </td>
                <td style={{ textAlign: 'center', padding: '12px 0', fontSize: '14px' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right', padding: '12px 0', fontSize: '14px', fontWeight: 600 }}>{formatPrice(item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <div style={{ display: 'flex', gap: '32px', fontSize: '14px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
            <span>{formatPrice(order.totalPrice)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div style={{ display: 'flex', gap: '32px', fontSize: '14px', color: '#22c55e' }}>
              <span>Diskon</span>
              <span>-{formatPrice(order.discountAmount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: '32px', fontSize: '18px', fontWeight: 700, borderTop: '2px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
            <span>Total</span>
            <span style={{ color: 'var(--color-secondary)' }}>{formatPrice(order.finalPrice)}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Terima kasih telah berbelanja di TokDig!
          </p>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Invoice ini dibuat otomatis dan tidak memerlukan tanda tangan.
          </p>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .navbar, nav, .btn, header, footer, .catalog-sidebar { display: none !important; }
          body { background: white !important; }
          #invoice { box-shadow: none !important; border: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '48px' }}><div className="spinner spinner-dark" style={{ width: 32, height: 32, margin: '0 auto' }} /></div>}>
      <InvoiceContent />
    </Suspense>
  );
}
