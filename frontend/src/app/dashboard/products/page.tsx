'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface ProductAccess {
  id: string;
  productId: string;
  productName: string;
  productSlug: string | null;
  status: string;
  startDate: string;
  endDate: string;
  accessInfo: Record<string, any>;
  daysRemaining: number | null;
}

export default function DashboardProductsPage() {
  const [products, setProducts] = useState<ProductAccess[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<any>('/dashboard/products');
        const data = res?.data || res;
        setProducts(data?.products || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>🎁 Produk Saya</h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <div className="spinner spinner-dark" style={{ width: 32, height: 32, margin: '0 auto' }} />
        </div>
      ) : products.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ fontSize: '32px', marginBottom: '8px' }}>🎁</p>
          <p style={{ fontWeight: 600, marginBottom: '4px' }}>Belum ada produk aktif</p>
          <p className="text-muted text-sm">Produk yang kamu beli akan muncul di sini</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {products.map((product) => {
            const isExpiringSoon = product.daysRemaining !== null && product.daysRemaining <= 7;
            const isExpired = product.status === 'expired' || (product.daysRemaining !== null && product.daysRemaining <= 0);

            return (
              <div key={product.id} className="card" style={{
                borderColor: isExpired ? 'rgba(255, 107, 107, 0.3)' : isExpiringSoon ? 'rgba(253, 203, 110, 0.3)' : undefined,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className={`badge ${isExpired ? 'badge-danger' : isExpiringSoon ? 'badge-warning' : 'badge-success'}`}>
                    {isExpired ? 'Expired' : isExpiringSoon ? 'Segera Habis' : 'Aktif'}
                  </span>
                  {product.daysRemaining !== null && !isExpired && (
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: isExpiringSoon ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    }}>
                      {product.daysRemaining} hari
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
                  {product.productSlug ? (
                    <Link href={`/products/${product.productSlug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {product.productName}
                    </Link>
                  ) : product.productName}
                </div>

                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                  {new Date(product.startDate).toLocaleDateString('id-ID')} — {new Date(product.endDate).toLocaleDateString('id-ID')}
                </div>

                {/* Access info */}
                {product.accessInfo && Object.keys(product.accessInfo).length > 0 && (
                  <div style={{
                    padding: '12px',
                    background: 'var(--color-bg-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                  }}>
                    {Object.entries(product.accessInfo).map(([key, value]) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                        <span className="text-muted">{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Progress bar */}
                {product.daysRemaining !== null && !isExpired && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{
                      height: '4px',
                      background: 'var(--color-border)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.max(5, Math.min(100, (product.daysRemaining / 30) * 100))}%`,
                        background: isExpiringSoon
                          ? 'var(--color-accent)'
                          : 'var(--color-secondary)',
                        borderRadius: '2px',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
